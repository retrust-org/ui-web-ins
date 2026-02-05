/**
 * ConsentService API 레이어 테스트
 * V3 API: X-Session-Token 헤더 기반 인증
 */

import {
  getRequestId,
  recordConsent,
  ConsentError,
  ERROR_CODES
} from '../consentService';

// Mock fetch
global.fetch = jest.fn();

describe('consentService', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('getRequestId', () => {
    it('should fetch requestId successfully', async () => {
      const mockRequestId = 'CD857_1732450800000_c2lnbnVwfG1yel9kaXNhc3Rlcg';
      const mockResponse = {
        success: true,
        data: {
          requestId: mockRequestId,
          purpose: 'signup',
          clientId: 'mrz_disaster',
          expiresAt: '2025-11-24T15:30:00.000Z'
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue(mockRequestId)
        },
        json: () => Promise.resolve(mockResponse)
      });

      const result = await getRequestId('signup', 'mrz_disaster');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/nice/api/request-id?purpose=signup&client_id=mrz_disaster'),
        expect.objectContaining({
          method: 'GET',
          credentials: 'include'
        })
      );

      expect(result.requestId).toBe(mockRequestId);
      expect(result.expiresAt).toBe('2025-11-24T15:30:00.000Z');
    });

    it('should extract X-Request-ID from response header (Phase 5.5)', async () => {
      const mockRequestId = 'CD857_REQ_1732512000_a1b2c3d4';
      const mockResponse = {
        success: true,
        data: {
          requestId: 'body-request-id', // body에도 있지만 헤더 우선
          expiresAt: '2025-11-24T15:30:00.000Z'
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: jest.fn().mockImplementation((name) => {
            if (name === 'X-Request-ID') return mockRequestId;
            return null;
          })
        },
        json: () => Promise.resolve(mockResponse)
      });

      const result = await getRequestId('signup', 'mrz_disaster');

      // X-Request-ID 헤더 값이 우선
      expect(result.requestId).toBe(mockRequestId);
    });

    it('should fallback to body requestId when header is missing', async () => {
      const mockRequestId = 'body-request-id';
      const mockResponse = {
        success: true,
        data: {
          requestId: mockRequestId,
          expiresAt: '2025-11-24T15:30:00.000Z'
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue(null) // 헤더 없음
        },
        json: () => Promise.resolve(mockResponse)
      });

      const result = await getRequestId('signup', 'mrz_disaster');

      // body에서 추출
      expect(result.requestId).toBe(mockRequestId);
    });

    it('should use default values for purpose and clientId', async () => {
      const mockResponse = {
        success: true,
        data: {
          requestId: 'test-request-id',
          expiresAt: '2025-11-24T15:30:00.000Z'
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('test-request-id')
        },
        json: () => Promise.resolve(mockResponse)
      });

      await getRequestId();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('purpose=signup&client_id=mrz_disaster'),
        expect.any(Object)
      );
    });

    it('should throw ConsentError on API failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: {
          get: jest.fn().mockReturnValue(null)
        },
        json: () => Promise.resolve({ error: 'SERVER_ERROR', message: 'Server error' })
      });

      await expect(getRequestId()).rejects.toThrow(ConsentError);
    });

    it('should throw ConsentError with reason field (Phase 5.5)', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: {
          get: jest.fn().mockReturnValue(null)
        },
        json: () => Promise.resolve({
          success: false,
          error: 'SESSION_EXPIRED',
          reason: 'IP_CHANGED',
          message: 'Session expired due to IP change'
        })
      });

      try {
        await getRequestId();
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ConsentError);
        expect(error.code).toBe('SESSION_EXPIRED');
        expect(error.reason).toBe('IP_CHANGED');
      }
    });
  });

  describe('recordConsent', () => {
    // V3 API: recordConsent(sessionToken, consentData)
    const mockSessionToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-session-token';
    const mockConsentData = {
      templateId: 1,
      consentVersion: '1.0',
      isAgreed: true
    };

    it('should send X-Session-Token header (V3 API)', async () => {
      const mockResponse = {
        success: true,
        data: {
          consentId: 123,
          recordedAt: '2025-11-24T15:00:00.000Z'
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      await recordConsent(mockSessionToken, mockConsentData);

      // X-Session-Token 헤더 검증
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/consent/record'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Session-Token': mockSessionToken
          }),
          body: expect.any(String),
          credentials: 'include'
        })
      );

      // Body에서 불필요한 필드 제거 검증
      const callBody = JSON.parse(fetch.mock.calls[0][1].body);
      expect(callBody.requestId).toBeUndefined();
      expect(callBody.fingerprint).toBeUndefined();
      expect(callBody.ipAddress).toBeUndefined();
      expect(callBody.userAgent).toBeUndefined();
    });

    it('should include only required fields in request body (V3 API)', async () => {
      const mockResponse = {
        success: true,
        data: { consentId: 123 }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      await recordConsent(mockSessionToken, mockConsentData);

      const callBody = JSON.parse(fetch.mock.calls[0][1].body);

      // 포함되어야 할 필드
      expect(callBody.templateId).toBe(1);
      expect(callBody.consentVersion).toBe('1.0');
      expect(callBody.isAgreed).toBe(true);

      // 제거되어야 할 필드 (V3 API)
      expect(callBody.requestId).toBeUndefined();
      expect(callBody.fingerprint).toBeUndefined();
    });

    it('should record consent successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          consentId: 123,
          recordedAt: '2025-11-24T15:00:00.000Z'
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await recordConsent(mockSessionToken, mockConsentData);

      expect(result.consentId).toBe(123);
    });

    it('should throw MISSING_SESSION_TOKEN error when token is null (V3 API)', async () => {
      await expect(recordConsent(null, mockConsentData))
        .rejects.toThrow('X-Session-Token is required');

      try {
        await recordConsent(null, mockConsentData);
      } catch (error) {
        expect(error).toBeInstanceOf(ConsentError);
        expect(error.code).toBe('MISSING_SESSION_TOKEN');
      }
    });

    it('should throw MISSING_SESSION_TOKEN error when token is empty string', async () => {
      await expect(recordConsent('', mockConsentData))
        .rejects.toThrow('X-Session-Token is required');
    });

    it('should handle SESSION_EXPIRED with reason field (V3 API)', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({
          success: false,
          error: 'SESSION_EXPIRED',
          reason: 'IP_CHANGED',
          message: 'Session expired due to IP change'
        })
      });

      try {
        await recordConsent(mockSessionToken, mockConsentData);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ConsentError);
        expect(error.code).toBe('SESSION_EXPIRED');
        expect(error.reason).toBe('IP_CHANGED');
      }
    });

    it('should handle SESSION_EXPIRED with DEVICE_CHANGED reason (V3 API)', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({
          success: false,
          error: 'SESSION_EXPIRED',
          reason: 'DEVICE_CHANGED',
          message: 'Session expired due to device change'
        })
      });

      try {
        await recordConsent(mockSessionToken, mockConsentData);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.code).toBe('SESSION_EXPIRED');
        expect(error.reason).toBe('DEVICE_CHANGED');
      }
    });

    it('should handle SESSION_EXPIRED with SESSION_TIMEOUT reason (V3 API)', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({
          success: false,
          error: 'SESSION_EXPIRED',
          reason: 'SESSION_TIMEOUT',
          message: '30분 세션 타임아웃'
        })
      });

      try {
        await recordConsent(mockSessionToken, mockConsentData);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.code).toBe('SESSION_EXPIRED');
        expect(error.reason).toBe('SESSION_TIMEOUT');
      }
    });

    it('should throw ConsentError on network failure', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(recordConsent(mockSessionToken, mockConsentData)).rejects.toThrow(ConsentError);
    });
  });

  describe('ConsentError', () => {
    it('should have correct properties', () => {
      const error = new ConsentError('Test message', 'TEST_CODE');

      expect(error.message).toBe('Test message');
      expect(error.code).toBe('TEST_CODE');
      expect(error.name).toBe('ConsentError');
    });

    it('should support reason field (Phase 5.5)', () => {
      const error = new ConsentError('Test message', 'SESSION_EXPIRED', 'IP_CHANGED');

      expect(error.message).toBe('Test message');
      expect(error.code).toBe('SESSION_EXPIRED');
      expect(error.reason).toBe('IP_CHANGED');
    });

    it('should have null reason by default', () => {
      const error = new ConsentError('Test message', 'TEST_CODE');

      expect(error.reason).toBeNull();
    });

    it('should extend Error', () => {
      const error = new ConsentError('Test', 'CODE');
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('ERROR_CODES', () => {
    it('should have all required error codes', () => {
      expect(ERROR_CODES.SESSION_EXPIRED).toBe('SESSION_EXPIRED');
      expect(ERROR_CODES.SESSION_BLOCKED).toBe('SESSION_BLOCKED');
      expect(ERROR_CODES.SESSION_INVALID).toBe('SESSION_INVALID');
      expect(ERROR_CODES.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ERROR_CODES.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(ERROR_CODES.SERVER_ERROR).toBe('SERVER_ERROR');
      expect(ERROR_CODES.MISSING_REQUEST_ID).toBe('MISSING_REQUEST_ID');
      expect(ERROR_CODES.MISSING_SESSION_TOKEN).toBe('MISSING_SESSION_TOKEN');
    });
  });
});
