// hooks/useTokenValidation.js
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTokenValidation, setCookie } from "../redux/store";

export const useTokenValidation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const isTokenValidated = useSelector((state) => state.auth.isTokenValidated);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const validateToken = async () => {
    if (isTokenValidated) {
      return isAuthenticated;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/trip-api/auth/checkToken`,
        {
          method: "GET",
          credentials: "include",
          redirect: "follow",
        }
      );

      if (!response.ok) {
        dispatch(setTokenValidation(false));
        return false;
      }

      const result = await response.json();

      dispatch(setCookie(result));
      dispatch(setTokenValidation(result.success));

      return result;
    } catch (error) {
      console.error("Token validation failed:", error);
      dispatch(setTokenValidation(false));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    validateToken,
    isLoading,
    isAuthenticated,
    isTokenValidated,
  };
};
