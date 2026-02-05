import csrfManager from '../../../utils/csrfTokenManager';

/**
 * 사업자번호 검증 서비스
 * POST /api/v3/disaster/business/verify
 */

/**
 * 사업자번호 검증 API 호출
 * @param {string} businessNumber - 사업자번호 (하이픈 제거된 10자리)
 * @param {string} businessName - 상호명
 * @returns {Promise<Object>} 검증 결과
 */
export const verifyBusinessNumber = async (businessNumber, businessName) => {
    try {
        // CSRF 토큰 가져오기
        const csrfToken = await csrfManager.getToken();

        const requestBody = {
            businessNumber: businessNumber,
            businessName: businessName
        };

        const response = await fetch(
            `${process.env.REACT_APP_BASE_URL}/disaster-api/api/v3/disaster/business/verify`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify(requestBody)
            }
        );

        // 403 에러 (CSRF 토큰 오류) 시 자동 재시도
        if (response.status === 403) {
            csrfManager.clearToken();
            const newToken = await csrfManager.getToken();

            const retryResponse = await fetch(
                `${process.env.REACT_APP_BASE_URL}/disaster-api/api/v3/disaster/business/verify`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': newToken
                    },
                    body: JSON.stringify(requestBody)
                }
            );

            const retryData = await retryResponse.json();

            // 재시도 실패 시 에러
            if (!retryResponse.ok) {
                throw new Error(retryData.message || '사업자번호 검증 중 오류가 발생했습니다.');
            }

            return retryData;
        }

        const data = await response.json();

        // HTTP 상태 코드 확인
        if (!response.ok) {
            throw new Error(data.message || '사업자번호 검증 중 오류가 발생했습니다.');
        }

        return data;

    } catch (error) {
        console.error('사업자번호 검증 API 호출 오류:', error);
        throw error;
    }
};

/**
 * API 응답에서 에러 확인 및 처리
 * @param {Object} response - API 응답 객체
 * @returns {boolean} 검증 성공 여부
 */
export const checkVerificationResult = (response) => {
    // success 필드가 false이면 검증 실패
    if (response.success === false) {
        return {
            isValid: false,
            errorCode: response.data?.errCd,
            errorMessage: response.data?.errMsg || '사업자번호 검증에 실패했습니다.'
        };
    }

    // data.isValid가 false이면 검증 실패
    if (response.data?.isValid === false) {
        return {
            isValid: false,
            errorCode: response.data?.status,
            errorMessage: response.data?.message || '사업자번호 검증에 실패했습니다.'
        };
    }

    // errCd가 "00001"이 아니면 검증 실패
    if (response.data?.errCd && response.data.errCd !== "00001") {
        return {
            isValid: false,
            errorCode: response.data.errCd,
            errorMessage: response.data.errMsg || '사업자번호 검증에 실패했습니다.'
        };
    }

    // 검증 성공
    return {
        isValid: true,
        errorCode: null,
        errorMessage: null
    };
};

/**
 * 에러 코드별 사용자 친화적 메시지 반환
 * @param {string} errorCode - 에러 코드
 * @param {string} defaultMessage - 기본 메시지
 * @returns {string} 사용자 친화적 메시지
 */
export const getBusinessErrorMessage = (errorCode, defaultMessage) => {
    const errorMessages = {
        '70020': '휴업 또는 폐업 중인 사업자입니다.\n다른 사업자번호로 시도해주세요.',
        '70021': '등록되지 않은 사업자번호입니다.\n사업자번호를 확인해주세요.',
        '70022': '사업자번호와 상호명이 일치하지 않습니다.\n입력 정보를 확인해주세요.'
    };

    return errorMessages[errorCode] || defaultMessage;
};
