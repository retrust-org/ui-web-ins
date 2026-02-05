import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setInsurance } from "../redux/store";

export const fetchData = async (dispatch) => {
  const requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  try {
    const response = await fetch(
      `${process.env.REACT_APP_BASE_URL}/trip-api/insurance`,
      requestOptions
    );

    if (!response.ok) {
      alert(`세션이 만료되었습니다.: ${response.status}`);
      window.location.href = "/login";
      return;
    }

    const data = await response.json();

    dispatch(setInsurance(data));
  } catch (error) {
    window.location.href = "/login";
  }
};

const ClaimUtilsApi = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDataAndHandleErrors = async () => {
      setLoading(true);
      setError(null);

      try {
        await fetchData(dispatch);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDataAndHandleErrors();
  }, [dispatch]);

  return { loading, error };
};

export default ClaimUtilsApi;
