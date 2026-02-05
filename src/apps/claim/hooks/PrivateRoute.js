import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setTokenValidation,
  setCookie,
  setMrzUser,
} from "../../../redux/store";
import Loading from "../../../components/loadings/Loading";

const PrivateRoute = ({ element }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const mrzUser = useSelector((state) => state.cookie.mrzUser);
  const currentPath = location.pathname;
  const currentSearch = new URLSearchParams(location.search);
  const redirectPath = currentSearch.get("redirect");

  // 리다이렉트가 필요없는 public 라우트들
  const noRedirectPaths = ["/"];

  useEffect(() => {
    const validateToken = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/trip-api/auth/checkToken`,
          {
            method: "GET",
            credentials: "include",
            redirect: "follow",
          }
        );

        if (!response.ok) {
          console.error("토큰 검증 실패 - HTTP 상태:", response.status);
          dispatch(setTokenValidation(false));
          return;
        }

        const result = await response.json();
        dispatch(setCookie(result));
        dispatch(setMrzUser(result.mrzUser));
        dispatch(setTokenValidation(result.success));
      } catch (error) {
        console.error("토큰 검증 중 에러:", error);
        dispatch(setTokenValidation(false));
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [currentPath, dispatch]);

  // public 라우트는 인증 상태와 관계없이 렌더링
  if (noRedirectPaths.includes(currentPath)) {
    return element;
  }

  // 로딩 중에는 로딩 컴포넌트 표시
  if (isLoading) {
    return <Loading />;
  }

  // EmergencySupport는 특별 처리 (기존 combine 로직 유지)
  if (currentPath === "/emergencySupport" && !mrzUser) {
    const redirectUrl = `/combine?redirect=${encodeURIComponent(
      currentPath +
      (currentSearch.toString() ? "?" + currentSearch.toString() : "")
    )}`;

    // Navigate 대신 window.location.href 사용
    window.location.href = `${window.location.origin}${window.basename}${redirectUrl}`;
    return <Loading />;
  }

  // 로그인이 필요한 경우
  if (!isAuthenticated) {
    const loginRedirect = `/login?redirect=${encodeURIComponent(
      currentPath +
      (currentSearch.toString() ? "?" + currentSearch.toString() : "")
    )}`;

    // Navigate 대신 window.location.href 사용 (basename 적용)
    window.location.href = `${window.location.origin}${window.basename}${loginRedirect}`;
    return <Loading />; // 리다이렉트 중 로딩 표시
  }

  return element;
};

export default PrivateRoute;