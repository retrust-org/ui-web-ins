import { useState } from 'react';
import csrfManager from '../../../../utils/csrfTokenManager';

/**
 * 결제 contract API 호출을 위한 커스텀 훅
 */
export const usePaymentContract = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [contractResult, setContractResult] = useState(null);

    /**
     * 결제 contract API 호출
     * @param {Object} paymentData - 결제 데이터
     * @returns {Promise} API 응답 결과
     */
    const submitPaymentContract = async (paymentData) => {
        try {
            setIsLoading(true);
            setError(null);

            const {
                prctrNo,           // 가계약번호
                efctPrd,           // 유효기간 YYYYMM
                dporNm,            // 예금주명
                rcptPrem,          // 영수보험료 (본인부담보험료)
                paymentMethod,     // 결제 수단 ('card' or 'bank')
                encryptedPayment   // 암호화된 결제 정보 (V3 API)
            } = paymentData;

            // V3 API: sessionStorage에서 sessionToken 가져오기
            const sessionContext = JSON.parse(sessionStorage.getItem('session_context') || '{}');
            const sessionToken = sessionContext.sessionToken || '';

            // 결제 수단에 따른 출수납형태상세코드 설정
            const pyrcShDtlCd = paymentMethod === 'card' ? '104' : '101';

            // 요청 body 생성 (V3 API - athNo 제거)
            const requestBody = {
                ctrCcluYn: "1",          // 계약체결여부: 1:계약체결
                pdCd: "17605",           // 상품코드: 17605(풍수해6 소공인)
                prctrNo: prctrNo,        // 가계약번호
                rcptPrem: String(rcptPrem), // 영수보험료 (문자열)
                pyrcShDtlCd: pyrcShDtlCd, // 출수납형태상세코드: 104(카드), 101(계좌)
                efctPrd: efctPrd,        // 유효기간 YYYYMM
                dporNm: dporNm,          // 예금주명
                encryptedFields: encryptedPayment  // 암호화된 결제 정보 (encryptedKey, encryptedData)
            };


            // CSRF 토큰 가져오기 (자동 갱신)
            const csrfToken = await csrfManager.getToken();

            const response = await fetch(
                `${process.env.REACT_APP_BASE_URL}/disaster-api/api/v3/disaster/contract`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': csrfToken,
                        'X-Session-Token': sessionToken
                    },
                    body: JSON.stringify(requestBody)
                }
            );

            // 403 에러 (CSRF 토큰 오류) 시 자동 재시도
            if (response.status === 403) {
                csrfManager.clearToken();
                const newToken = await csrfManager.getToken();

                const retryResponse = await fetch(
                    `${process.env.REACT_APP_BASE_URL}/disaster-api/api/v3/disaster/contract`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-Token': newToken,
                            'X-Session-Token': sessionToken
                        },
                        body: JSON.stringify(requestBody)
                    }
                );

                const retryResponseData = await retryResponse.json();

                const retryData = retryResponseData.data;

                // 재시도도 실패하면 에러
                if (!retryResponse.ok || (retryData.errCd && retryData.errCd !== "00001")) {
                    throw new Error(retryData.errMsg || retryData.error?.message || "결제 처리 중 오류가 발생했습니다.");
                }

                setContractResult(retryData);
                return retryData;
            }

            const responseData = await response.json();

            const data = responseData.data;

            // errCd 체크 - "00001"이 아니면 에러
            if (data.errCd && data.errCd !== "00001") {
                throw new Error(data.errMsg || "결제 처리 중 오류가 발생했습니다.");
            }

            setContractResult(data);
            return data;

        } catch (error) {
            console.error("결제 Contract API 호출 오류:", error);
            setError(error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        error,
        contractResult,
        submitPaymentContract
    };
};
