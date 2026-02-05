import { useEffect, useState, useCallback } from 'react';

/**
 * 재해보험 NICE 본인인증 커스텀 훅
 * SSO Auth Server의 postMessage 방식 사용
 * @param {Function} onSuccess - 인증 성공 시 콜백 함수
 * @param {Function} onError - 인증 실패 시 콜백 함수 (선택)
 * @returns {Object} { openAuthPopup: Function }
 */
export const useDisasterAuth = (onSuccess, onError) => {
  const [authPopup, setAuthPopup] = useState(null);

  useEffect(() => {
    // postMessage로 인증 결과 수신
    const handleMessage = (event) => {
      // 관련 없는 메시지 조기 필터링 (로그 없이)
      // 1. origin 검증
      // 2. 객체여야 함
      // 3. source 필드가 없어야 함 (React DevTools 등 제외)
      // 4. success 필드가 있어야 함 (본인인증 결과)
      if (!event.origin.includes('retrust.world') ||
          !event.data ||
          typeof event.data !== 'object' ||
          'source' in event.data ||
          !('success' in event.data)) {
        return;
      }

      const { success, data, error } = event.data;

      // 본인인증 관련 메시지만 로그 출력
      console.log('==== 본인인증 결과 수신 ====');
      console.log('success:', success);
      console.log('data:', data);
      console.log('error:', error);
      console.log('============================');

      // 팝업 창 닫기
      if (authPopup) {
        authPopup.close();
        setAuthPopup(null);
      }

      if (success) {
        console.log('==== 본인인증 성공 ====');
        console.log('수신 data:', data);
        console.log('userData:', data?.userData);
        console.log('token:', data?.token);
        console.log('========================');

        // 인증 성공 시 콜백 실행
        if (onSuccess) {
          // 기존 데이터 구조와 호환되도록 매핑
          const result = {
            name: data.userData?.name,
            birthdate: data.userData?.birthdate,
            mobileno: data.userData?.phone,
            gender: data.userData?.gender,
            athNo: data.token,  // JWT 토큰을 인증번호로 사용
            token: data.token,
            tokenType: data.tokenType,
            isExistingUser: data.isExistingUser,
            accountId: data.accountId
          };
          console.log('변환된 result:', result);
          onSuccess(result);
        }
      } else {
        console.log('==== 본인인증 실패 ====');
        console.log('error:', error);
        console.log('========================');

        // 인증 실패 시 에러 콜백 실행
        if (onError) {
          onError(error);
        } else {
          console.error('본인인증 실패:', error);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // 컴포넌트 언마운트 시 cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
      // 팝업 창이 열려있으면 닫기
      if (authPopup) {
        authPopup.close();
      }
    };
  }, [authPopup, onSuccess, onError]);

  const openAuthPopup = useCallback((sessionToken, purpose = 'default') => {
    // SSO Auth Server의 NICE 본인인증 URL
    // V3 API: sessionToken을 쿼리 파라미터로 전달 (팝업 URL에는 헤더 설정 불가)
    const authUrl = `${process.env.REACT_APP_BASE_URL}/sign-api/nice/checkplus_main?purpose=${purpose}&client_id=mrz_disaster&session_token=${encodeURIComponent(sessionToken || '')}`;

    const width = 500;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const popup = window.open(
      authUrl,
      'disasterAuthPopup',
      `width=${width},height=${height},left=${left},top=${top},fullscreen=no,menubar=no,status=no,toolbar=no,titlebar=yes,location=no,scrollbar=no`
    );

    // 팝업 차단 감지
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      if (onError) {
        onError({
          code: 'POPUP_BLOCKED',
          message: '팝업이 차단되었습니다. 브라우저 설정에서 팝업 차단을 해제해주세요.'
        });
      } else {
        alert('팝업 차단을 해제해주세요.\n\n설정 > 사이트 설정 > 팝업 및 리디렉션 > 허용');
      }
      return;
    }

    setAuthPopup(popup);
  }, [onError]);

  return { openAuthPopup };
};
