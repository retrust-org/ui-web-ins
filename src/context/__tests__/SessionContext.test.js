/**
 * SessionContext 테스트
 * TDD: 통합된 세션 관리 Context 테스트
 *
 * 기능:
 * - sessionToken 저장/읽기
 * - sessionStorage 영속성
 * - 세션 에러 처리 (ErrorModal)
 */

import React from 'react';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider, useSession } from '../SessionContext';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock ErrorModal
jest.mock('../../components/modals/ErrorModal', () => {
  return function MockErrorModal({ message, subMsg, onClose }) {
    return (
      <div data-testid="error-modal">
        <span data-testid="error-message">{message}</span>
        <span data-testid="error-submsg">{subMsg}</span>
        <button data-testid="error-close-btn" onClick={onClose}>닫기</button>
      </div>
    );
  };
});

// Test component to access context
const TestComponent = ({ onContext }) => {
  const context = useSession();

  React.useLayoutEffect(() => {
    if (onContext) onContext(context);
  });

  return (
    <div>
      <span data-testid="session-token">{context.sessionToken || 'null'}</span>
    </div>
  );
};

// Wrapper with Router
const renderWithRouter = (ui) => {
  return render(
    <MemoryRouter>
      {ui}
    </MemoryRouter>
  );
};

describe('SessionContext', () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockNavigate.mockClear();
    delete window.showSessionError;
  });

  describe('SessionProvider 기본 동작', () => {
    it('초기값은 null이어야 한다', () => {
      renderWithRouter(
        <SessionProvider>
          <TestComponent />
        </SessionProvider>
      );

      expect(screen.getByTestId('session-token').textContent).toBe('null');
    });

    it('useSession이 Provider 외부에서 사용되면 에러가 발생해야 한다', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderWithRouter(<TestComponent />);
      }).toThrow('useSession must be used within a SessionProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('sessionToken 관리', () => {
    it('setSessionToken으로 토큰을 설정할 수 있다', async () => {
      let contextValue;
      const mockExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

      renderWithRouter(
        <SessionProvider>
          <TestComponent onContext={(ctx) => { contextValue = ctx; }} />
        </SessionProvider>
      );

      await act(async () => {
        contextValue.setSessionToken('test-session-token', mockExpiresAt);
      });

      expect(contextValue.sessionToken).toBe('test-session-token');
    });

    it('sessionStorage에 토큰이 저장되어야 한다', async () => {
      let contextValue;
      const mockExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

      renderWithRouter(
        <SessionProvider>
          <TestComponent onContext={(ctx) => { contextValue = ctx; }} />
        </SessionProvider>
      );

      await act(async () => {
        contextValue.setSessionToken('test-session-token', mockExpiresAt);
      });

      const saved = JSON.parse(sessionStorage.getItem('session_context'));
      expect(saved).toBeDefined();
      expect(saved.sessionToken).toBe('test-session-token');
      expect(saved.expiresAt).toBe(mockExpiresAt);
    });

    it('clearSession으로 토큰을 초기화할 수 있다', async () => {
      let contextValue;

      renderWithRouter(
        <SessionProvider>
          <TestComponent onContext={(ctx) => { contextValue = ctx; }} />
        </SessionProvider>
      );

      // 먼저 토큰 설정
      await act(async () => {
        contextValue.setSessionToken('test-token', new Date(Date.now() + 30 * 60 * 1000).toISOString());
      });

      // 초기화
      act(() => {
        contextValue.clearSession();
      });

      expect(contextValue.sessionToken).toBeNull();
      expect(sessionStorage.getItem('session_context')).toBeNull();
    });
  });

  describe('sessionStorage 영속성', () => {
    it('새로고침 후에도 토큰이 유지되어야 한다', async () => {
      const savedData = {
        sessionToken: 'saved-session-token',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      };
      sessionStorage.setItem('session_context', JSON.stringify(savedData));

      let contextValue;

      renderWithRouter(
        <SessionProvider>
          <TestComponent onContext={(ctx) => { contextValue = ctx; }} />
        </SessionProvider>
      );

      await waitFor(() => {
        expect(contextValue.sessionToken).toBe('saved-session-token');
      });
    });

    it('잘못된 JSON이 저장되어 있으면 null로 시작해야 한다', () => {
      sessionStorage.setItem('session_context', 'invalid-json');

      let contextValue;

      renderWithRouter(
        <SessionProvider>
          <TestComponent onContext={(ctx) => { contextValue = ctx; }} />
        </SessionProvider>
      );

      expect(contextValue.sessionToken).toBeNull();
    });
  });

  describe('세션 에러 처리', () => {
    it('window.showSessionError가 등록되어야 한다', () => {
      renderWithRouter(
        <SessionProvider>
          <TestComponent />
        </SessionProvider>
      );

      expect(typeof window.showSessionError).toBe('function');
    });

    it('언마운트 시 window.showSessionError가 제거되어야 한다', () => {
      const { unmount } = renderWithRouter(
        <SessionProvider>
          <TestComponent />
        </SessionProvider>
      );

      unmount();

      expect(window.showSessionError).toBeUndefined();
    });

    it('에러 발생 시 ErrorModal이 표시되어야 한다', async () => {
      renderWithRouter(
        <SessionProvider>
          <TestComponent />
        </SessionProvider>
      );

      // 초기에는 모달이 없어야 함
      expect(screen.queryByTestId('error-modal')).not.toBeInTheDocument();

      // 에러 발생
      act(() => {
        window.showSessionError({
          reason: 'SESSION_TIMEOUT',
          message: '세션이 만료되었습니다.'
        });
      });

      // 모달이 표시되어야 함
      expect(screen.getByTestId('error-modal')).toBeInTheDocument();
      expect(screen.getByTestId('error-message').textContent).toBe('세션 오류');
      expect(screen.getByTestId('error-submsg').textContent).toBe('세션이 만료되었습니다.');
    });

    it('모달 닫기 시 clearSession이 호출되어야 한다', async () => {
      let contextValue;

      renderWithRouter(
        <SessionProvider>
          <TestComponent onContext={(ctx) => { contextValue = ctx; }} />
        </SessionProvider>
      );

      // 토큰 설정
      await act(async () => {
        contextValue.setSessionToken('test-token', new Date(Date.now() + 30 * 60 * 1000).toISOString());
      });

      // 에러 발생
      act(() => {
        window.showSessionError({ reason: 'SESSION_TIMEOUT', message: '세션 만료' });
      });

      // 모달 닫기 버튼 클릭
      fireEvent.click(screen.getByTestId('error-close-btn'));

      // 세션이 초기화되어야 함
      expect(contextValue.sessionToken).toBeNull();
      expect(sessionStorage.getItem('session_context')).toBeNull();
    });

    it('모달 닫기 시 /price로 네비게이트 되어야 한다', async () => {
      renderWithRouter(
        <SessionProvider>
          <TestComponent />
        </SessionProvider>
      );

      // 에러 발생
      act(() => {
        window.showSessionError({ reason: 'SESSION_TIMEOUT', message: '세션 만료' });
      });

      // 모달 닫기 버튼 클릭
      fireEvent.click(screen.getByTestId('error-close-btn'));

      // /price로 네비게이트 되어야 함
      expect(mockNavigate).toHaveBeenCalledWith('/price');
    });
  });

  describe('미사용 기능 제거 확인', () => {
    it('isExpired 함수가 없어야 한다', () => {
      let contextValue;

      renderWithRouter(
        <SessionProvider>
          <TestComponent onContext={(ctx) => { contextValue = ctx; }} />
        </SessionProvider>
      );

      expect(contextValue.isExpired).toBeUndefined();
    });

    it('getRemainingTime 함수가 없어야 한다', () => {
      let contextValue;

      renderWithRouter(
        <SessionProvider>
          <TestComponent onContext={(ctx) => { contextValue = ctx; }} />
        </SessionProvider>
      );

      expect(contextValue.getRemainingTime).toBeUndefined();
    });

    it('setExpired 함수가 없어야 한다', () => {
      let contextValue;

      renderWithRouter(
        <SessionProvider>
          <TestComponent onContext={(ctx) => { contextValue = ctx; }} />
        </SessionProvider>
      );

      expect(contextValue.setExpired).toBeUndefined();
    });

    it('setBlocked 함수가 없어야 한다', () => {
      let contextValue;

      renderWithRouter(
        <SessionProvider>
          <TestComponent onContext={(ctx) => { contextValue = ctx; }} />
        </SessionProvider>
      );

      expect(contextValue.setBlocked).toBeUndefined();
    });

    it('status가 없어야 한다', () => {
      let contextValue;

      renderWithRouter(
        <SessionProvider>
          <TestComponent onContext={(ctx) => { contextValue = ctx; }} />
        </SessionProvider>
      );

      expect(contextValue.status).toBeUndefined();
    });
  });
});
