/**
 * apiClient.js
 * disasterSafeguard 전용 Axios 인스턴스
 * - sessionToken이 필요한 API에만 사용
 * - 세션 만료 에러 자동 처리 (인터셉터)
 *
 * 적용 대상 API:
 * - 동의 기록: /sign-api/api/consent/record
 * - 가계약: /disaster-api/api/v3/disaster/provisional-contract
 * - 영수계약: /disaster-api/api/v3/disaster/contract
 */

import axios from 'axios';

const apiClient = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * 요청 인터셉터: X-Session-Token 자동 주입
 * - sessionStorage의 session_context에서 sessionToken 읽기
 */
apiClient.interceptors.request.use(
  (config) => {
    const sessionData = sessionStorage.getItem('session_context');
    if (sessionData) {
      try {
        const { sessionToken } = JSON.parse(sessionData);
        if (sessionToken) {
          config.headers['X-Session-Token'] = sessionToken;
        }
      } catch (e) {
        console.error('session_context 파싱 오류:', e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 응답 인터셉터: 세션 만료 에러 처리
 * - 403 SESSION_EXPIRED: 세션 만료/무효/디바이스 변경
 * - 400 MISSING_SESSION_TOKEN: 토큰 없음
 *
 * window.showSessionError()는 SessionErrorContext에서 등록됨
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status, data } = error.response || {};

    // 403 SESSION_EXPIRED 처리
    if (status === 403 && data?.error === 'SESSION_EXPIRED') {
      const messageMap = {
        'SESSION_TIMEOUT': '세션이 만료되었습니다. 보험료 조회부터 다시 진행해 주세요.',
        'INVALID_TOKEN': '세션 정보가 올바르지 않습니다. 보험료 조회부터 다시 진행해 주세요.',
        'DEVICE_CHANGED': '디바이스 또는 네트워크가 변경되었습니다. 보험료 조회부터 다시 진행해 주세요.'
      };

      const message = messageMap[data.reason] || data.message || '세션 오류가 발생했습니다.';

      if (window.showSessionError) {
        window.showSessionError({
          reason: data.reason,
          message
        });
      }
    }

    // 400 MISSING_SESSION_TOKEN 처리
    if (status === 400 && data?.error === 'MISSING_SESSION_TOKEN') {
      if (window.showSessionError) {
        window.showSessionError({
          reason: 'MISSING_TOKEN',
          message: '세션 정보가 없습니다. 보험료 조회부터 다시 진행해 주세요.'
        });
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
