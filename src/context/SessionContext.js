/**
 * SessionContext
 * 세션 토큰 관리 + 세션 에러 처리 통합 Context
 *
 * 기능:
 * - sessionToken 저장/읽기 (sessionStorage 영속성)
 * - 세션 에러 감지 시 ErrorModal 표시
 * - 확인 클릭 시 세션 초기화 + /price 리다이렉트
 *
 * 사용처:
 * - disasterSafeguard Router에서 SessionProvider로 감싸기
 * - 컴포넌트에서 useSession() 훅으로 접근
 */

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorModal from '../components/modals/ErrorModal';

const STORAGE_KEY = 'session_context';

const SessionContext = createContext(null);

/**
 * SessionProvider 컴포넌트
 * - sessionToken 상태 관리
 * - sessionStorage 영속성
 * - 세션 에러 모달 렌더링
 */
export function SessionProvider({ children }) {
  const navigate = useNavigate();

  // 세션 토큰 상태 (sessionStorage에서 복원)
  const [sessionToken, setSessionTokenState] = useState(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const rawToken = parsed.sessionToken;
        // 토큰 정규화: "Bearer " 접두사 제거
        const normalizedToken = rawToken ? rawToken.replace(/^Bearer\s+/i, '') : null;
        return normalizedToken;
      } catch {
        return null;
      }
    }
    return null;
  });

  // 세션 에러 상태
  const [sessionError, setSessionError] = useState(null);

  // 세션 토큰 설정 (sessionStorage에도 저장)
  const setSessionToken = useCallback((token, expiresAt) => {
    // 토큰 정규화: "Bearer " 접두사 제거
    const normalizedToken = token ? token.replace(/^Bearer\s+/i, '') : null;
    setSessionTokenState(normalizedToken);
    if (normalizedToken) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        sessionToken: normalizedToken,
        expiresAt
      }));
    }
  }, []);

  // 세션 초기화
  const clearSession = useCallback(() => {
    setSessionTokenState(null);
    setSessionError(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  // Axios 인터셉터 연결용 전역 함수 등록
  useEffect(() => {
    window.showSessionError = (errorInfo) => {
      setSessionError(errorInfo);
    };

    return () => {
      delete window.showSessionError;
    };
  }, []);

  // 에러 모달 닫기 핸들러
  const handleErrorClose = useCallback(() => {
    clearSession();
    navigate('/price');
  }, [clearSession, navigate]);

  return (
    <SessionContext.Provider value={{ sessionToken, setSessionToken, clearSession }}>
      {children}
      {sessionError && (
        <ErrorModal
          message="세션 오류"
          subMsg={sessionError.message}
          onClose={handleErrorClose}
        />
      )}
    </SessionContext.Provider>
  );
}

/**
 * useSession 훅
 * SessionContext에 접근하기 위한 커스텀 훅
 *
 * @returns {{ sessionToken: string|null, setSessionToken: function, clearSession: function }}
 * @throws {Error} SessionProvider 외부에서 사용 시 에러
 */
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

export default SessionContext;
