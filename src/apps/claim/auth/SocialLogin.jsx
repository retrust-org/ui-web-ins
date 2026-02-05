import React from "react";
import { useLocation } from "react-router-dom";
import styles from "../../../css/claim/claimIntro.module.css";

/**
 * 소셜 로그인 컴포넌트
 * 네이버와 카카오 OAuth 로그인 버튼을 제공
 */
const SocialLogin = () => {
  const location = useLocation();

  const handleLogin = (provider) => {
    const currentSearch = new URLSearchParams(location.search);
    const redirectPath = currentSearch.get("redirect") || "/";

    console.log(`[${provider} 로그인] 시작 - redirect:`, redirectPath);

    window.location.href = `/oauth/${provider}/login?redirect=${encodeURIComponent(redirectPath)}`;
  };

  return (
    <>
      <li className={styles.naverLogin} onClick={() => handleLogin('naver')}>
        <img src="/images/oauth/naver-login.png" alt="naver-login" />
      </li>
      <li className={styles.kakaoLogin} onClick={() => handleLogin('kakao')}>
        <img src="/images/oauth/kakao_login_large_narrow.png" alt="kakao-login" />
      </li>
    </>
  );
};

export default SocialLogin;