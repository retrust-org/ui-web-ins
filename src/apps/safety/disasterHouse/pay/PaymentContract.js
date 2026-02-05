import { useState } from 'react';
import csrfManager from '../../../../utils/csrfTokenManager';
import { checkApiError } from '../../../../utils/checkApiError';

/**
 * 주택풍수해 결제 contract API 호출을 위한 커스텀 훅
 */
export const usePaymentContract = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [contractResult, setContractResult] = useState(null);

    /**
     * 결제 contract API 호출
     * @param {Object} paymentData - 결제 데이터
     * @param {Function} setErrorModal - 에러 모달 상태 setter
     * @returns {Promise} API 응답 결과
     */
    const submitPaymentContract = async (paymentData, setErrorModal) => {
        try {
            setIsLoading(true);

            const {
                prctrNo,           // 가계약번호
                efctPrd,           // 유효기간 YYYYMM (카드결제 시)
                dporNm,            // 예금주명
                rcptPrem,          // 영수보험료 (본인부담보험료)
                paymentMethod,     // 결제 수단 ('card' or 'bank')
                bnkCd,             // 은행코드 (계좌이체 시)
                bnkNm,             // 은행명 (계좌이체 시)
                encryptedPayment   // 암호화된 결제 정보
            } = paymentData;

            // 결제 수단에 따른 출수납형태상세코드 설정
            const pyrcShDtlCd = paymentMethod === 'card' ? '104' : '101';

            // 요청 body 생성 (공통 필드)
            const requestBody = {
                ctrCcluYn: "1",             // 계약체결여부: 1:계약체결
                pdCd: "17604",              // 상품코드: 17604(주택풍수해)
                prctrNo: prctrNo,           // 가계약번호
                rcptPrem: String(rcptPrem), // 영수보험료 (문자열)
                pyrcShDtlCd: pyrcShDtlCd,   // 출수납형태상세코드: 104(카드), 101(계좌)
                dporNm: dporNm,             // 예금주명
                encryptedFields: encryptedPayment  // 암호화된 결제 정보 (V3 API)
            };

            // 결제 수단별 추가 필드
            if (paymentMethod === 'card') {
                requestBody.efctPrd = efctPrd;  // 유효기간 YYYYMM (카드)
            } else {
                requestBody.bnkCd = bnkCd;      // 은행코드 (계좌이체)
                requestBody.bnkNm = bnkNm;      // 은행명 (계좌이체)
            }

            console.log("=== 주택풍수해 결제 Contract API 요청 (V3) ===");
            console.log("Request Body:", requestBody);

            // V3 API: sessionStorage에서 sessionToken 가져오기
            const sessionContext = JSON.parse(sessionStorage.getItem('session_context') || '{}');
            const sessionToken = sessionContext.sessionToken || '';

            // CSRF 토큰 가져오기 (자동 갱신)
            const csrfToken = await csrfManager.getToken();

            const response = await fetch(
                `${process.env.REACT_APP_BASE_URL}/disaster-api/api/v3/disaster/contract`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': csrfToken,
                        'X-Session-Token': sessionToken  // V3 API requirement
                    },
                    body: JSON.stringify(requestBody)
                }
            );

            // 403 에러 (CSRF 토큰 오류) 시 자동 재시도
            if (response.status === 403) {
                console.log('CSRF 토큰 오류 (403), 재발급 후 재시도...');
                csrfManager.clearToken();
                const newToken = await csrfManager.getToken();

                const retryResponse = await fetch(
                    `${process.env.REACT_APP_BASE_URL}/disaster-api/api/v3/disaster/contract`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-Token': newToken,
                            'X-Session-Token': sessionToken  // V3 API requirement
                        },
                        body: JSON.stringify(requestBody)
                    }
                );

                const retryResponseData = await retryResponse.json();
                const retryData = retryResponseData.data;

                console.log("=== 주택풍수해 결제 Contract API 재시도 응답 ===");
                console.log(retryResponseData);

                if (!checkApiError(retryData, setErrorModal)) return null;

                setContractResult(retryData);
                return retryData;
            }

            const responseData = await response.json();
            const data = responseData.data;

            console.log("=== 주택풍수해 결제 Contract API 응답 ===");
            console.log(responseData);

            if (!checkApiError(data, setErrorModal)) return null;

            setContractResult(data);
            return data;

        } catch (error) {
            console.error("결제 Contract API 호출 오류:", error);
            setErrorModal({
                isOpen: true,
                message: error.message || "결제 처리 중 오류가 발생했습니다.",
                subMsg: "고객센터에 문의해주세요."
            });
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        contractResult,
        submitPaymentContract
    };
};
