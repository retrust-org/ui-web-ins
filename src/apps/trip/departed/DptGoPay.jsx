import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { loadScript } from "../../../utils/loadScript";
import Button from "../../../components/buttons/Button";
import { useLocation } from "react-router-dom";
import ErrorModal from "../../../components/modals/ErrorModal";
import { PLAN_KEYS } from "../../../data/ConfirmPlanData";

function DptGoPay() {
  const selectedPlanName = useSelector((state) => state.plan.selectedPlanName);
  const totalPrice = useSelector((state) => state.totalPrice.totalPrice);
  const priceData = useSelector((state) => state.priceData.priceData);
  const selectedData = useSelector((state) => state.plan.selectedData);
  const inspeCnts = priceData?.DEPARTED?.inspeCnt;
  const gender = useSelector((state) => state.user.gender);
  const dateOfBirth = useSelector((state) => state.user.dateOfBirth);
  const companions = useSelector((state) => state.companions);
  const [hashString, setHashString] = useState("");
  const [ediDate, setEdiDate] = useState("");
  const [mID, setMID] = useState("");
  const [moID, setMoID] = useState("");
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const errCd = searchParams.get("errCd");
  const errMsg = searchParams.get("errMsg");
  const [error, setError] = useState(false);
  const [errorData, setErrorData] = useState("");
  const { cityNatlCd, engCityNm, korNatlNm } = useSelector((state) =>
    state.country.selectedCountryData
      ? state.country.selectedCountryData
      : state.country.recommendedCountryData
  );
  const { selectedStartDate, selectedEndDate } = useSelector(
    (state) => state.calendar
  );

  const onCloseModal = () => {
    setError(false);
  };

  const propsUserDataAndCompanionData = useSelector(
    (state) => state.members.members
  );

  const companionsName = propsUserDataAndCompanionData.companionData
    ? propsUserDataAndCompanionData.companionData.map(
        (companion) => companion.name
      )
    : [];
  const companionsEngName = propsUserDataAndCompanionData.companionData
    ? propsUserDataAndCompanionData.companionData.map(
        (companion) => companion.englishName
      )
    : [];

  const companionsPhone = propsUserDataAndCompanionData.companionData
    ? propsUserDataAndCompanionData.companionData.map(
        (companion) => companion.phoneNumber
      )
    : [];

  const companionsEmail = propsUserDataAndCompanionData.companionData
    ? propsUserDataAndCompanionData.companionData.map(
        (companion) => companion.email
      )
    : [];

  const getPlanCd = () => {
    if (!priceData) return null;

    if (priceData.hasDeparted) {
      return priceData.DEPARTED?.opapiGnrCoprCtrInspeInfCbcVo[0]?.planCd;
    } else {
      const planKey =
        PLAN_KEYS[selectedPlanName] || PLAN_KEYS[selectedData?.name];
      const planData = priceData[planKey]?.opapiGnrCoprCtrInspeInfCbcVo;
      if (!planData) return null;
      return planData[0]?.planCd;
    }
  };

  const companionGetPlanCd = (planName) => {
    if (!priceData) return [];

    if (priceData.hasDeparted) {
      return (
        priceData.DEPARTED?.opapiGnrCoprCtrInspeInfCbcVo.map(
          (companion) => companion.planCd
        ) || []
      );
    } else {
      const planKey = PLAN_KEYS[planName];
      const planData = priceData[planKey]?.opapiGnrCoprCtrInspeInfCbcVo;
      return planData?.map((companion) => companion.planCd) || [];
    }
  };
  const effectivePlanName = selectedPlanName || selectedData?.name || null;
  const selectedPlanCd = getPlanCd();
  const companionPlanCds = companionGetPlanCd(effectivePlanName);

  const userInfo = {
    planCd: selectedPlanCd,
    inspeBdt: dateOfBirth || "",
    gndrCd: gender || "",
    inspeNm: propsUserDataAndCompanionData.name || "",
    engInspeNm: propsUserDataAndCompanionData.englishName || "",
    phone: propsUserDataAndCompanionData.phoneNumber || "",
    email: propsUserDataAndCompanionData.email || "",
  };

  const companionInfos = companions.map((companion, index) => ({
    planCd: companionPlanCds[index + 1] || "",
    inspeBdt: companion.dateOfBirth || "",
    gndrCd: companion.gender || "",
    inspeNm: companionsName[index] || "",
    engInspeNm: companionsEngName[index] || "",
    phone: companionsPhone[index] || "",
    email: companionsEmail[index] || "",
  }));

  const contractInfos = [userInfo, ...companionInfos];

  const insuranceData = {
    insBgnDt: selectedStartDate || "",
    insEdDt: selectedEndDate || "",
    natlCd: cityNatlCd || "",
    inspeCnt: inspeCnts || 0,
    contractInfos: contractInfos,
  };

  const mintData = {
    productCd: priceData?.productCd,
    card_quantity: inspeCnts,
    start_date: selectedStartDate,
    end_date: selectedEndDate,
    natlCd: cityNatlCd,
    nation: korNatlNm,
    city: engCityNm || "",
    redirectUrl: `${window.location.origin}${window.basename}`,
  };

  // 전역 데이터에서 상품명 가져오기
  const getProductName = () =>
    window.productApiData?.data?.masterPolicies?.[0]?.Product?.product_nm ||
    "해외여행 의료비실손보험";

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

    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/v3/pay/order`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: totalPrice,
              productCd: priceData?.productCd,
              orderVO: {
                insBgnDt: insuranceData.insBgnDt,
                insEdDt: insuranceData.insEdDt,
                natlCd: insuranceData.natlCd,
                inspeCnt: insuranceData.inspeCnt,
                contractInfos: insuranceData.contractInfos,
              },
            }),
          }
        );
        const data = await response.json();

        if (errCd && errCd !== "00001") {
          setError(true);
          setErrorData(errMsg);
        } else if (data.errCd && data.errCd !== "00001") {
          setError(true);
          setErrorData(data.errMsg);
        } else if (data.errCd === "00001") {
          setHashString(data.hashString);
          setEdiDate(data.ediDate);
          setMID(data.mid);
          setMoID(data.moid);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchData();

    window.nicepaySubmit = function () {
      const payForm = document.getElementById("payForm");
      if (payForm) {
        payForm.submit();
      } else {
        console.error("payForm is not found");
      }
    };
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
    payForm.action = `${process.env.REACT_APP_BASE_URL}/pay/authReq`;
    payForm.acceptCharset = "euc-kr";
    payForm.enctype = "application/x-www-form-urlencoded";

    payForm.appendChild(createInputElement("PayMethod", "CARD"));

    // API에서 가져온 상품명 사용
    const productName = getProductName();
    payForm.appendChild(
      createInputElement("GoodsName", "(해외)" + productName)
    );

    payForm.appendChild(createInputElement("Amt", totalPrice));
    payForm.appendChild(createInputElement("MID", mID));
    payForm.appendChild(createInputElement("Moid", moID));
    payForm.appendChild(createInputElement("BuyerName", userInfo.inspeNm));
    payForm.appendChild(createInputElement("BuyerEmail", userInfo.email));
    payForm.appendChild(createInputElement("BuyerTel", userInfo.phone));
    payForm.appendChild(
      // 프로덕션은 window.location에서 host 추가해야 정상작동됨
      // createInputElement("ReturnURL", `${window.location.origin}/pay/authReq`)
      createInputElement(
        "ReturnURL",
        process.env.NODE_ENV === "development"
          ? `${process.env.REACT_APP_REDIRECT_URL}/pay/authReq`
          : `${window.location.origin}/pay/authReq`
      )
    );
    payForm.appendChild(createInputElement("NpLang", "KO"));
    payForm.appendChild(createInputElement("TransType", "0"));
    payForm.appendChild(createInputElement("CharSet", "utf-8"));
    payForm.appendChild(
      createInputElement("ReqReserved", encodeJsonToBase64(mintData))
    );
    payForm.appendChild(createInputElement("EdiDate", ediDate));
    payForm.appendChild(createInputElement("SignData", hashString));

    document.body.appendChild(payForm);
    if (window.goPay) {
      window.goPay(payForm);
    } else {
      console.error("goPay function is not available");
    }
  };

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
  const createInputElement = (name, value) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    return input;
  };

  return (
    <>
      {error && <ErrorModal message={`${errorData}`} onClose={onCloseModal} />}
      <Button buttonText="결제하기" onClick={nicepayStart}></Button>
    </>
  );
}

export default DptGoPay;
