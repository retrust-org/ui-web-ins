import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import styles from "../../../css/claim/nice.module.css";
import { login } from "../../../redux/store";
import phoneLogin from "../../../assets/phoneLogin.svg";

const GoNice = () => {
  const [niceWin, setNiceWin] = useState(null);
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  
  // 팝업 창 안전하게 닫기 함수
  const closeNiceWindow = () => {
    if (niceWin && !niceWin.closed) {
      try {
        niceWin.close();
        console.log("본인인증 팝업 창이 정상적으로 닫혔습니다.");
      } catch (error) {
        console.error("본인인증 팝업 창 닫기 실패:", error);
        // iOS나 다른 환경에서 창 닫기 실패 시에도 프로세스 계속 진행
      }
      setNiceWin(null);
    }
  };

  useEffect(() => {
    // 전역 receiveToken 함수 등록
    window.receiveToken = (result) => {
      
      try {
        
        const myHeaders = new Headers();
        myHeaders.append("token", result.token);
        
        const requestOptions = {
          method: "GET",
          headers: myHeaders,
        };
        
        // 서버에 쿠키 설정 요청
        fetch("/trip-api/auth/getCookie", requestOptions)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          // 팝업 창 안전하게 닫기
          closeNiceWindow();
          
          // Redux 스토어에 로그인 정보 저장
          dispatch(login(JSON.stringify(result)));
        })
        .catch((error) => {
            setError("인증 처리 중 오류가 발생했습니다. 다시 시도해 주세요.");
            
            // 오류 발생 시에도 팝업 창은 닫기
            closeNiceWindow();
          });
      } catch (error) {
        console.error("인증 결과 처리 중 오류:", error);
        setError("인증 처리 중 오류가 발생했습니다. 다시 시도해 주세요.");
        closeNiceWindow();
      }
    };

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (window.receiveToken) {
        delete window.receiveToken;
      }
      closeNiceWindow();
    };
  }, [niceWin]);

  // 팝업 창 상태 모니터링
  useEffect(() => {
    if (!niceWin) return;

    const checkPopupStatus = setInterval(() => {
      if (niceWin.closed) {
        console.log("사용자가 팝업 창을 수동으로 닫았습니다.");
        setNiceWin(null);
        clearInterval(checkPopupStatus);
      }
    }, 1000);

    return () => {
      clearInterval(checkPopupStatus);
    };
  }, [niceWin]);

  const handleClick = () => {
    try {
      // 기존 팝업이 있다면 먼저 정리
      closeNiceWindow();
      
      // 오류 상태 초기화
      setError(null);

      const newWindow = window.open(
        `/auth/checkplus_main`,
        "popupChk",
        "width=500, height=550, top=100, left=100, fullscreen=no, menubar=no, status=no, toolbar=no, titlebar=yes, location=no, scrollbar=no"
      );

      if (newWindow) {
        setNiceWin(newWindow);
        console.log("본인인증 팝업 창이 열렸습니다.");
      } else {
        setError("팝업 창을 열 수 없습니다. 브라우저 설정에서 팝업을 허용해주세요.");
        console.error("팝업 창 열기 실패 - 브라우저에서 차단되었을 수 있습니다.");
      }
    } catch (error) {
      console.error("본인인증 팝업 열기 중 오류:", error);
      setError("본인인증을 시작할 수 없습니다. 다시 시도해 주세요.");
    }
  };

  return (
    <>
      <div className={styles.phoneLoginBtn} onClick={handleClick}>
        <img src={phoneLogin} alt="" />
        <p>휴대폰 본인인증 로그인</p>
      </div>
      {error && (
        <p className={styles.errorMessage} role="alert">
          {error}
        </p>
      )}
    </>
  );
};

export default GoNice;