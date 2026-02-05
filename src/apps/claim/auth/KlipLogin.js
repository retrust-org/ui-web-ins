import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { login } from "../../../redux/store";
import claimintroClip from "../../../assets/claimintroClip.svg";
import styles from "../../../css/claim/nice.module.css";
import QRCodeModal from "../../../components/modals/QRCodeModal";
import ErrorModal from "../../../components/modals/ErrorModal";

function KlipLogin() {
  const dispatch = useDispatch();

  // 로컬 상태
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [error, setError] = useState(null);

  // KLIP 데이터 저장용
  const klipDataRef = useRef({
    requestId: null,
    deepLink: null,
  });

  // 타이머 및 팝업 참조
  const refreshTimerRef = useRef(null);
  const loginTimeoutRef = useRef(null);
  const popupRef = useRef(null);

  // 플랫폼 감지
  const detectPlatform = () => {
    const userAgent = navigator.userAgent;
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent));
    setIsIOS(/iPad|iPhone|iPod/.test(userAgent));
  };

  // 리소스 정리
  const cleanupResources = () => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    popupRef.current = null;

    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    if (loginTimeoutRef.current) {
      clearTimeout(loginTimeoutRef.current);
      loginTimeoutRef.current = null;
    }

  };

  // KLIP 데이터 가져오기
  const fetchKlipData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/auth/klip`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (response.ok && result.data) {
        const { request_id, deep_link } = result.data;
        klipDataRef.current = {
          requestId: request_id,
          deepLink: deep_link,
        };
      } else {
        throw new Error("KLIP 데이터 가져오기 실패");
      }
    } catch (error) {
      setError("KLIP 데이터를 가져오는데 실패했습니다.");
    }
  };

  // 자동 갱신 설정
  const setupAutoRefresh = () => {
    cleanupResources();
    refreshTimerRef.current = setInterval(() => {
      fetchKlipData();
    }, 60 * 1000);
  };

  // executeDeepLink 수정
  const executeDeepLink = (targetDeepLink) => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
      popupRef.current = null;
    }

    if (isMobile) {
      if (isIOS) {
        // iOS에서는 새탭으로 열기
        const popup = window.open(targetDeepLink, '_blank');
        popupRef.current = popup;
      } else {
        // Android는 기존 방식
        const popup = window.open(targetDeepLink, 'KlipLogin', 'width=400,height=600');
        popupRef.current = popup;
      }


      // 5초 후 팝업 정리
      setTimeout(() => {
        try {
          if (popupRef.current && !popupRef.current.closed) {
            popupRef.current.close();
          }
        } catch (error) {
          // 차단되어도 무시
        }
        popupRef.current = null;
      }, 5000);
    } else {
      setQrCodeData(targetDeepLink);
      setShowQrModal(true);
    }
  };

  // 로그인 상태 확인
  const checkLoginStatus = async (targetRequestId) => {
    loginTimeoutRef.current = setTimeout(() => {
      setError("인증 시간이 만료되었습니다.");
      cleanupResources();
      setShowQrModal(false);
    }, 40 * 1000);

    try {
      const response = await fetch(`/auth/klip_login?requestId=${targetRequestId}`, {
        method: "GET",
        signal: AbortSignal.timeout(40000)
      });

      const result = await response.json();

      if (result.success) {
        // 성공 시 먼저 리소스 정리
        clearTimeout(loginTimeoutRef.current);
        cleanupResources();
        setShowQrModal(false);

        dispatch(login(JSON.stringify(result)));
      } else {
        throw new Error(result.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      alert(`[DEBUG] 오류: ${error.message}`);
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        setError("인증 시간이 만료되었습니다.");
      } else {
        setError("로그인 처리 중 오류가 발생했습니다.");
      }

      cleanupResources();
      setShowQrModal(false);
    }
  };

  // KLIP 로그인 처리
  const handleKlipLogin = async () => {
    const { requestId, deepLink } = klipDataRef.current;

    if (!requestId || !deepLink) {
      setError("KLIP 인증 데이터가 준비되지 않았습니다.");
      return;
    }

    executeDeepLink(deepLink);
    await checkLoginStatus(requestId);
  };

  // 에러 모달 닫기
  const handleCloseError = () => {
    setError(null);
    setShowQrModal(false);
    setQrCodeData("");
    cleanupResources();

    setTimeout(() => {
      fetchKlipData();
    }, 500);
  };

  // QR 모달 닫기
  const handleCloseQrModal = () => {
    setShowQrModal(false);
    cleanupResources();
  };

  // 초기화
  useEffect(() => {
    detectPlatform();
    fetchKlipData();
    setupAutoRefresh();

    return () => {
      cleanupResources();
    };
  }, []);

  return (
    <>
      <div
        className={styles.ClipLoginBtn}
        onClick={handleKlipLogin}
      >
        <img src={claimintroClip} alt="클립 로그인" />
        <p>클립으로 로그인</p>
      </div>

      {showQrModal && (
        <QRCodeModal
          onClose={handleCloseQrModal}
          qrCodeData={qrCodeData}
        />
      )}

      {error && (
        <ErrorModal
          message={error}
          onClose={handleCloseError}
        />
      )}
    </>
  );
}

export default React.memo(KlipLogin);