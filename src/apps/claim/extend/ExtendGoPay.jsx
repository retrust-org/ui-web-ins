import React, { useEffect, useState } from "react";
import { loadScript } from "../../../utils/loadScript";
import ErrorModal from "../../../components/modals/ErrorModal";
import { useSelector } from "react-redux";
import DisclaimerModal from "../../../components/modals/DisclaimerModal";
import ClaimButton from "../../../components/buttons/ClaimButton";

function ExtendGoPay({ payData, changeCost }) {
  const [error, setError] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const token = useSelector((state) => state.cookie.cookie);
  const BuyerName = token.name;

  //새로운 변수 시작
  const amount = changeCost?.amount;
  const orderVO = changeCost?.orderVO;
  const productName = changeCost?.product_name;
  const Emails = orderVO?.contractInfos?.map((e) => e.email);
  const Email = Emails?.[0];
  const Phones = orderVO?.contractInfos?.map((e) => e.phone);
  const Phone = Phones?.[0];
  const mid = payData?.mid;
  const moid = payData?.moid;
  const ediDates = payData?.ediDate;
  const hashStrings = payData?.hashString;
  const reservedData={
    productCd:payData?.productCd,
    isActive:changeCost?.isActive,
    redirectUrl: `${window.location.origin}${window.basename}`,
  }
  //끝

  function encodeJsonToBase64(obj) {
    const jsonString = JSON.stringify(obj);
    return btoa(
      encodeURIComponent(jsonString).replace(
        /%([0-9A-F]{2})/g,
        function (match, p1) {
          return String.fromCharCode("0x" + p1);
        }
      )
    );
  }

  const onCloseModal = () => {
    setError(false);
  };

  useEffect(() => {
    const loadNicepayScript = async () => {
      try {
        await loadScript(
          "https://pg-web.nicepay.co.kr/v3/common/js/nicepay-pgweb.js"
        );
        console.log("Nicepay script loaded successfully");
      } catch (error) {
        console.error("Failed to load Nicepay script", error);
      }
    };
    loadNicepayScript();

    //[PC Only] When pc payment window is closed, nicepay-pgweb.js call back nicepaySubmit() function <<'nicepaySubmit()' DO NOT CHANGE>>
    window.nicepaySubmit = function () {
      const payForm = document.getElementById("payForm");
      if (payForm) {
        payForm.submit();
      } else {
        console.error("payForm is not found");
      }
    };
    //[PC Only] payment window close function <<'nicepayClose()' DO NOT CHANGE>>
    window.nicepayClose = function () {
      alert("결제가 취소 되었습니다");
      window.close();
    };
  }, []);

  const nicepayStart = () => {
    const payForm = document.createElement("form");
    payForm.id = "payForm";
    payForm.style.display = "none";
    payForm.method = "POST";
    payForm.action = `${process.env.REACT_APP_BASE_URL}/api/v3/pay/authReq/extension`;
    payForm.acceptCharset = "euc-kr";
    payForm.enctype = "application/x-www-form-urlencoded";
    payForm.appendChild(createInputElement("PayMethod", "CARD"));
    payForm.appendChild(createInputElement("GoodsName", productName));
    payForm.appendChild(createInputElement("Amt", amount)); //amount
    payForm.appendChild(createInputElement("MID", mid)); //mid
    payForm.appendChild(createInputElement("Moid", moid));
    payForm.appendChild(createInputElement("BuyerName", BuyerName)); //userInfo.inspeNm
    payForm.appendChild(createInputElement("BuyerEmail", Email)); //userInfo.email
    payForm.appendChild(createInputElement("BuyerTel", Phone)); //userInfo.phone
    payForm.appendChild(createInputElement("ReturnURL", `${window.location.origin}/api/v3/pay/authReq/extension`));
    payForm.appendChild(createInputElement("NpLang", "KO"));
    payForm.appendChild(createInputElement("TransType", "0"));
    payForm.appendChild(createInputElement("CharSet", "utf-8"));
    payForm.appendChild(createInputElement("ReqReserved", encodeJsonToBase64(reservedData)));
    payForm.appendChild(createInputElement("EdiDate", ediDates));
    payForm.appendChild(createInputElement("SignData", hashStrings));

    document.body.appendChild(payForm);
    if (window.goPay) {
      window.goPay(payForm);
    } else {
      console.error("goPay function is not available");
    }
  };

  const createInputElement = (name, value) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    return input;
  };

  const handlePaymentClick = () => {
    setShowDisclaimer(true);
  };

  const handleConfirm = () => {
    setShowDisclaimer(false);
    nicepayStart();
  };

  const handleCancel = () => {
    setShowDisclaimer(false);
  };

  return (
    <>
      {error && (
        <ErrorModal message="결제에 실패했습니다." onClose={onCloseModal} />
      )}
      {showDisclaimer && (
        <DisclaimerModal
          message="결제 안내"
          subMsg="보험 체결이 완료되면, 기존결제 금액이 전액 환불됩니다."
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
      <ClaimButton buttonText="결제하기" onClick={handlePaymentClick} />
    </>
  );
}

export default ExtendGoPay;
