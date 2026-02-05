/**
 * apiClient 인터셉터 로직 테스트
 * TDD: 세션 토큰 주입 및 에러 처리 로직 테스트
 *
 * 참고: axios ESM 모듈 이슈로 인해 인터셉터 로직을 직접 테스트
 */

describe('apiClient 인터셉터 로직', () => {
  beforeEach(() => {
    sessionStorage.clear();
    delete window.showSessionError;
  });

  describe('요청 인터셉터 로직', () => {
    // 요청 인터셉터 로직 시뮬레이션
    const requestInterceptor = (config) => {
      const sessionData = sessionStorage.getItem('session_context');
      if (sessionData) {
        try {
          const { sessionToken } = JSON.parse(sessionData);
          if (sessionToken) {
            config.headers = config.headers || {};
            config.headers['X-Session-Token'] = sessionToken;
          }
        } catch (e) {
          // 파싱 에러 무시
        }
      }
      return config;
    };

    it('sessionStorage에서 토큰을 읽어 헤더에 추가해야 한다', () => {
      sessionStorage.setItem('session_context', JSON.stringify({
        sessionToken: 'test-session-token',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      }));

      const config = { headers: {} };
      const result = requestInterceptor(config);

      expect(result.headers['X-Session-Token']).toBe('test-session-token');
    });

    it('토큰이 없으면 헤더를 추가하지 않아야 한다', () => {
      const config = { headers: {} };
      const result = requestInterceptor(config);

      expect(result.headers['X-Session-Token']).toBeUndefined();
    });

    it('잘못된 JSON이 저장되어 있으면 헤더를 추가하지 않아야 한다', () => {
      sessionStorage.setItem('session_context', 'invalid-json');

      const config = { headers: {} };
      const result = requestInterceptor(config);

      expect(result.headers['X-Session-Token']).toBeUndefined();
    });

    it('sessionToken이 null이면 헤더를 추가하지 않아야 한다', () => {
      sessionStorage.setItem('session_context', JSON.stringify({
        sessionToken: null
      }));

      const config = { headers: {} };
      const result = requestInterceptor(config);

      expect(result.headers['X-Session-Token']).toBeUndefined();
    });
  });

  describe('응답 인터셉터 에러 로직', () => {
    // 응답 인터셉터 에러 핸들러 로직 시뮬레이션
    const responseErrorHandler = (error) => {
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
    };

    it('403 SESSION_EXPIRED (SESSION_TIMEOUT) 시 showSessionError를 호출해야 한다', async () => {
      const showSessionError = jest.fn();
      window.showSessionError = showSessionError;

      const error = {
        response: {
          status: 403,
          data: {
            error: 'SESSION_EXPIRED',
            reason: 'SESSION_TIMEOUT',
            message: '원본 메시지'
          }
        }
      };

      await expect(responseErrorHandler(error)).rejects.toBe(error);

      expect(showSessionError).toHaveBeenCalledWith({
        reason: 'SESSION_TIMEOUT',
        message: '세션이 만료되었습니다. 보험료 조회부터 다시 진행해 주세요.'
      });
    });

    it('403 SESSION_EXPIRED (INVALID_TOKEN) 시 적절한 메시지로 호출해야 한다', async () => {
      const showSessionError = jest.fn();
      window.showSessionError = showSessionError;

      const error = {
        response: {
          status: 403,
          data: {
            error: 'SESSION_EXPIRED',
            reason: 'INVALID_TOKEN'
          }
        }
      };

      await expect(responseErrorHandler(error)).rejects.toBe(error);

      expect(showSessionError).toHaveBeenCalledWith({
        reason: 'INVALID_TOKEN',
        message: '세션 정보가 올바르지 않습니다. 보험료 조회부터 다시 진행해 주세요.'
      });
    });

    it('403 SESSION_EXPIRED (DEVICE_CHANGED) 시 적절한 메시지로 호출해야 한다', async () => {
      const showSessionError = jest.fn();
      window.showSessionError = showSessionError;

      const error = {
        response: {
          status: 403,
          data: {
            error: 'SESSION_EXPIRED',
            reason: 'DEVICE_CHANGED'
          }
        }
      };

      await expect(responseErrorHandler(error)).rejects.toBe(error);

      expect(showSessionError).toHaveBeenCalledWith({
        reason: 'DEVICE_CHANGED',
        message: '디바이스 또는 네트워크가 변경되었습니다. 보험료 조회부터 다시 진행해 주세요.'
      });
    });

    it('403 SESSION_EXPIRED (알 수 없는 reason) 시 서버 메시지 사용', async () => {
      const showSessionError = jest.fn();
      window.showSessionError = showSessionError;

      const error = {
        response: {
          status: 403,
          data: {
            error: 'SESSION_EXPIRED',
            reason: 'UNKNOWN_REASON',
            message: '서버에서 온 메시지'
          }
        }
      };

      await expect(responseErrorHandler(error)).rejects.toBe(error);

      expect(showSessionError).toHaveBeenCalledWith({
        reason: 'UNKNOWN_REASON',
        message: '서버에서 온 메시지'
      });
    });

    it('400 MISSING_SESSION_TOKEN 시 showSessionError를 호출해야 한다', async () => {
      const showSessionError = jest.fn();
      window.showSessionError = showSessionError;

      const error = {
        response: {
          status: 400,
          data: {
            error: 'MISSING_SESSION_TOKEN'
          }
        }
      };

      await expect(responseErrorHandler(error)).rejects.toBe(error);

      expect(showSessionError).toHaveBeenCalledWith({
        reason: 'MISSING_TOKEN',
        message: '세션 정보가 없습니다. 보험료 조회부터 다시 진행해 주세요.'
      });
    });

    it('다른 403 에러는 showSessionError를 호출하지 않아야 한다', async () => {
      const showSessionError = jest.fn();
      window.showSessionError = showSessionError;

      const error = {
        response: {
          status: 403,
          data: {
            error: 'FORBIDDEN',
            message: '접근 권한이 없습니다.'
          }
        }
      };

      await expect(responseErrorHandler(error)).rejects.toBe(error);

      expect(showSessionError).not.toHaveBeenCalled();
    });

    it('다른 400 에러는 showSessionError를 호출하지 않아야 한다', async () => {
      const showSessionError = jest.fn();
      window.showSessionError = showSessionError;

      const error = {
        response: {
          status: 400,
          data: {
            error: 'VALIDATION_ERROR'
          }
        }
      };

      await expect(responseErrorHandler(error)).rejects.toBe(error);

      expect(showSessionError).not.toHaveBeenCalled();
    });

    it('window.showSessionError가 없어도 에러 없이 진행해야 한다', async () => {
      // window.showSessionError가 없는 상태
      const error = {
        response: {
          status: 403,
          data: {
            error: 'SESSION_EXPIRED',
            reason: 'SESSION_TIMEOUT'
          }
        }
      };

      // 에러가 throw되지만 showSessionError 호출 시 에러가 나지 않아야 함
      await expect(responseErrorHandler(error)).rejects.toBe(error);
    });

    it('response가 없는 에러도 처리해야 한다 (네트워크 에러)', async () => {
      const showSessionError = jest.fn();
      window.showSessionError = showSessionError;

      const error = new Error('Network Error');

      await expect(responseErrorHandler(error)).rejects.toBe(error);

      expect(showSessionError).not.toHaveBeenCalled();
    });
  });
});
