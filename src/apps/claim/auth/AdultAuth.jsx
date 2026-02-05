import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../../../css/claim/nice.module.css";
import phoneLogin from "../../../assets/phoneLogin.svg";
import ClaimButton from "../../../components/buttons/ClaimButton";

const AdultAuth = ({
  parentChk = false,
  receptionistInfo = null,
  onClose,
  isAuthInProgress = false,
  onAuthStart,
  onAuthSuccess,
  onAuthError,
}) => {
  const [niceWin, setNiceWin] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 본인인증 결과 처리 함수
    window.receiveAuthResult = (result) => {
      console.log("receiveAuthResult called:", result);

      // 팝업 창 닫기
      if (niceWin) {
        niceWin.close();
        setNiceWin(null);
      }

      const getRedirectPath = () => {
        const params = new URLSearchParams(location.search);
        const redirectPath = params.get("redirect");

        if (parentChk) {
          return "/insuredpeopleInfo";
        }

        return redirectPath || "/";
      };

      if (result.success) {
        console.log("✅ 친권자 인증 성공");

        // 성공 콜백 호출
        if (onAuthSuccess) {
          onAuthSuccess();
        }

        // ParentChk 모달 닫기 (있는 경우)
        if (onClose) {
          onClose();
        }

        // 인증 성공 시 리다이렉트
        const redirectPath = getRedirectPath();
        navigate(redirectPath);
      } else {
        console.log("❌ 친권자 인증 실패:", result.message);

        // 실패 메시지 설정
        let errorMessage = "본인인증에 실패했습니다. 다시 시도해 주세요.";

        if (result.message) {
          errorMessage = result.message;
        }

        // 상세 오류 정보가 있는 경우 추가 처리
        if (result.details && result.details.errcode) {
          console.log("상세 오류 정보:", result.details);

          // 특정 에러 코드에 따른 메시지 커스터마이징
          if (result.details.errcode === "MISMATCH") {
            errorMessage = "입력하신 정보와 본인인증 정보가 일치하지 않습니다.";
          }
        }

        // 에러 콜백 호출
        if (onAuthError) {
          onAuthError(errorMessage);
        }
      }
    };

    // 컴포넌트 언마운트 시 cleanup
    return () => {
      if (window.receiveAuthResult) {
        delete window.receiveAuthResult;
      }
      // 팝업 창이 열려있으면 닫기
      if (niceWin) {
        niceWin.close();
      }
    };
  }, [
    navigate,
    niceWin,
    location,
    parentChk,
    onClose,
    onAuthSuccess,
    onAuthError,
  ]);

  const handleClick = () => {
    // 본인인증 시작 콜백 호출
    if (onAuthStart) {
      onAuthStart();
    }

    let authUrl = `${process.env.REACT_APP_BASE_URL}/adultAuth/checkplus_main`;

    if (parentChk && receptionistInfo) {
      const params = new URLSearchParams();
      params.append("name", receptionistInfo.name);
      params.append("birth", receptionistInfo.dateOfBirth);
      authUrl += `?${params.toString()}`;

      console.log("친권자 인증 URL:", authUrl);
      console.log("접수자 정보:", {
        name: receptionistInfo.name,
        birth: receptionistInfo.dateOfBirth,
      });
    }

    const newWindow = window.open(
      authUrl,
      "popupChk",
      "width=500, height=550, top=100, left=100, fullscreen=no, menubar=no, status=no, toolbar=no, titlebar=yes, location=no, scrollbar=no"
    );

    setNiceWin(newWindow);
  };

  if (parentChk) {
    return (
      <ClaimButton
        buttonText={isAuthInProgress ? "인증 진행 중..." : "네, 맞습니다"}
        onClick={handleClick}
        disabled={isAuthInProgress}
      />
    );
  }

  return (
    <div
      className={styles.phoneLoginBtn}
      onClick={handleClick}
      style={{
        opacity: isAuthInProgress ? 0.6 : 1,
        pointerEvents: isAuthInProgress ? "none" : "auto",
      }}
    >
      <img src={phoneLogin} alt="" />
      <p>{isAuthInProgress ? "인증 진행 중..." : "휴대폰 본인인증 로그인"}</p>
    </div>
  );
};

export default AdultAuth;
