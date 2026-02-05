import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorModal from "../../../components/modals/ErrorModal";
import SuccessModal from "../../../components/modals/SuccessModal";
import Loading from "../../../components/loadings/Loading";
import ClaimButton from "../../../components/buttons/ClaimButton";

function ExtendBtn({ payData, changeCost }) {
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const moid = payData?.moid;
  const productCd = payData?.productCd;
  const isActive = changeCost?.isActive;

  const onCloseModal = () => {
    setError(false);
    navigate("/claimExtendDate");
  };

  const onCloseSuccessModal = () => {
    setSuccess(false);
    navigate("/claimExtendDate");
  };

  const handleExtend = async () => {
    setIsLoading(true);
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      moid,
      isActive,
      productCd,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        "/trip-api/api/v1/trip/extendContract",
        requestOptions
      );
      const result = await response.json();

      if (result.isExtended) {
        setSuccess(true);
        setMessage("도착일 변경을");
      } else {
        throw new Error("Extension failed");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(true);
      setMessage("도착일변경 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <Loading />}
      {error && <ErrorModal message={message} onClose={onCloseModal} />}
      {success && (
        <SuccessModal message={message} onClose={onCloseSuccessModal} />
      )}
      <ClaimButton buttonText="변경하기" onClick={handleExtend} />
    </>
  );
}

export default ExtendBtn;
