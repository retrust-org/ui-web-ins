/**
 * ConsentService API 레이어
 * V3 API: X-Session-Token 헤더 기반 인증
 */

// 에러 코드 상수
export const ERROR_CODES = {
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  SESSION_BLOCKED: 'SESSION_BLOCKED',
  SESSION_INVALID: 'SESSION_INVALID',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  MISSING_SESSION_TOKEN: 'MISSING_SESSION_TOKEN'
};

// 커스텀 에러 클래스 (Phase 5.5: reason 필드 추가)
export class ConsentError extends Error {
  constructor(message, code, reason = null) {
    super(message);
    this.name = 'ConsentError';
    this.code = code;
    this.reason = reason;  // Phase 5.5: IP_CHANGED, DEVICE_CHANGED, SESSION_TIMEOUT 등
  }
}

// API 기본 URL
const getBaseUrl = () => {
  return process.env.REACT_APP_BASE_URL || '';
};

/**
 * SessionToken을 발급받습니다.
 * V3 API: X-Session-Token 헤더 기반 인증
 * @param {string} purpose - 목적 (예: 'contract(17604)', 'contract(17605)')
 * @returns {Promise<Object>} sessionToken, expiresAt 포함
 * @throws {ConsentError} API 실패 시
 */
export async function getSessionToken(purpose = 'signup') {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/sign-api/nice/api/session-token?purpose=${encodeURIComponent(purpose)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ConsentError(
        data.message || 'Failed to get session token',
        data.error || ERROR_CODES.SERVER_ERROR,
        data.reason
      );
    }

    if (!data.success) {
      throw new ConsentError(
        data.error?.message || data.message || 'Failed to get session token',
        data.error?.code || data.error || ERROR_CODES.SERVER_ERROR,
        data.reason
      );
    }

    // 헤더 또는 body에서 sessionToken 추출
    const tokenFromHeader = response.headers.get('X-Session-Token');
    const tokenFromBody = data.data?.sessionToken;

    // 토큰 정규화: "Bearer " 접두사 제거
    const rawToken = tokenFromHeader || tokenFromBody;
    const normalizedToken = rawToken ? rawToken.replace(/^Bearer\s+/i, '') : null;

    return {
      sessionToken: normalizedToken,
      expiresAt: data.data?.expiresAt
    };
  } catch (error) {
    if (error instanceof ConsentError) {
      throw error;
    }

    throw new ConsentError(
      error.message || 'Network error while getting session token',
      ERROR_CODES.NETWORK_ERROR
    );
  }
}

/**
 * 동의 기록을 저장합니다.
 * V3 API: sessionToken을 X-Session-Token 헤더로 전달
 * @param {string} sessionToken - 세션 토큰 (X-Session-Token 헤더로 전달)
 * @param {Object} consentData - 동의 데이터
 * @param {number} consentData.templateId - 템플릿 ID
 * @param {string} consentData.consentVersion - 동의 버전
 * @param {boolean} consentData.isAgreed - 동의 여부
 * @returns {Promise<Object>} consentId, recordedAt 등 포함
 * @throws {ConsentError} API 실패 시
 */
export async function recordConsent(sessionToken, consentData) {
  // V3 API: sessionToken 필수 검증
  if (!sessionToken) {
    throw new ConsentError(
      'X-Session-Token is required',
      ERROR_CODES.MISSING_SESSION_TOKEN
    );
  }

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/sign-api/api/consent/record`;

  const { templateId, consentVersion, isAgreed } = consentData;

  try {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Session-Token': sessionToken  // V3 API: 통일된 세션 토큰 헤더
      },
      body: JSON.stringify({
        templateId,
        consentVersion,
        isAgreed
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ConsentError(
        data.message || 'Failed to record consent',
        data.error || ERROR_CODES.SERVER_ERROR,
        data.reason  // Phase 5.5: reason 필드
      );
    }

    if (!data.success) {
      throw new ConsentError(
        data.error?.message || data.message || 'Failed to record consent',
        data.error?.code || data.error || ERROR_CODES.SERVER_ERROR,
        data.reason
      );
    }

    return data.data;
  } catch (error) {
    if (error instanceof ConsentError) {
      throw error;
    }

    throw new ConsentError(
      error.message || 'Network error while recording consent',
      ERROR_CODES.NETWORK_ERROR
    );
  }
}

/**
 * 에러 코드가 세션 관련 에러인지 확인합니다.
 * @param {string} code - 에러 코드
 * @returns {boolean}
 */
export function isSessionError(code) {
  return [
    ERROR_CODES.SESSION_EXPIRED,
    ERROR_CODES.SESSION_BLOCKED,
    ERROR_CODES.SESSION_INVALID,
    ERROR_CODES.MISSING_SESSION_TOKEN
  ].includes(code);
}

/**
 * 에러 코드에 따른 사용자 메시지를 반환합니다.
 * Phase 5.5: reason 기반 상세 메시지 지원
 * @param {string} code - 에러 코드
 * @param {string} reason - 에러 원인 (Phase 5.5)
 * @returns {string} 사용자 친화적 메시지
 */
export function getErrorMessage(code, reason = null) {
  // Phase 5.5: SESSION_EXPIRED + reason 조합 메시지
  if (code === ERROR_CODES.SESSION_EXPIRED && reason) {
    const reasonMessages = {
      'IP_CHANGED': '네트워크가 변경되어 세션이 만료되었습니다. 본인인증을 다시 진행해주세요.',
      'DEVICE_CHANGED': '브라우저 정보가 변경되어 세션이 만료되었습니다. 본인인증을 다시 진행해주세요.',
      'SESSION_TIMEOUT': '30분 동안 활동이 없어 세션이 만료되었습니다. 본인인증을 다시 진행해주세요.',
      'CONTEXT_NOT_FOUND': '유효하지 않은 세션입니다. 본인인증을 다시 진행해주세요.'
    };
    return reasonMessages[reason] || '세션이 만료되었습니다. 처음부터 다시 진행해 주세요.';
  }

  const messages = {
    [ERROR_CODES.SESSION_EXPIRED]: '세션이 만료되었습니다. 처음부터 다시 진행해 주세요.',
    [ERROR_CODES.SESSION_BLOCKED]: '보안상의 이유로 세션이 차단되었습니다. 처음부터 다시 진행해 주세요.',
    [ERROR_CODES.SESSION_INVALID]: '유효하지 않은 세션입니다. 처음부터 다시 진행해 주세요.',
    [ERROR_CODES.VALIDATION_ERROR]: '입력 정보를 확인해 주세요.',
    [ERROR_CODES.NETWORK_ERROR]: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    [ERROR_CODES.SERVER_ERROR]: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    [ERROR_CODES.MISSING_SESSION_TOKEN]: '세션 정보가 없습니다. 보험료 조회부터 다시 진행해주세요.'
  };

  return messages[code] || '오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
}

const consentService = {
  getSessionToken,
  recordConsent,
  isSessionError,
  getErrorMessage,
  ConsentError,
  ERROR_CODES
};

export default consentService;
