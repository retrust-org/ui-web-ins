import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Button from "../../components/common/Button";

function Payment() {
  const selectedPlanName = useSelector((state) => state.plan.selectedPlanName);
  const selectedData = useSelector((state) => state.plan.selectedData);
  const priceData = useSelector((state) => state.priceData.priceData);
  const inspeCnts = priceData?.BASIC?.inspeCnt;
  const startDate = useSelector((state) => state.calendar.selectedStartDate);
  const endDate = useSelector((state) => state.calendar.selectedEndDate);
  const gender = useSelector((state) => state.user.gender);
  const dateOfBirth = useSelector((state) => state.user.dateOfBirth);
  const companions = useSelector((state) => state.companions);
  const [clientId, setClientId] = useState("");
  const [orderId, setOrderId] = useState("");
  // const [totalPrice, setTotalPrice] = useState("");
  const [groupNo, setGroupNo] = useState("");
  const [reqNo, setReqNo] = useState("");

  const propsUserDataAndCompanionData = useSelector(
    (state) => state.members.members
  );

  const selectedCountryData = useSelector(
    (state) => state.country.selectedCountryData
  );
  const recommendedCountry = useSelector(
    (state) => state.country.recommendedCountryData
  );

  // Check if propsUserDataAndCompanionData.companionData is defined
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
  const companionssecretNumber = propsUserDataAndCompanionData.companionData
    ? propsUserDataAndCompanionData.companionData.map(
        (companion) => companion.secretNumberFirstPart
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

  const getCityNatlCd = (selectedCountryData, recommendedCountry) => {
    if (selectedCountryData && selectedCountryData.cityNatlCd) {
      return selectedCountryData.cityNatlCd;
    } else if (recommendedCountry && recommendedCountry.cityNatlCd) {
      return recommendedCountry.cityNatlCd;
    } else {
      return;
    }
  };
  const natlCds = getCityNatlCd(selectedCountryData, recommendedCountry);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/pay", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok) {
          setClientId(data.clientId);
          setOrderId(data.orderId);
        } else {
          console.error("Error:", data);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();

    const script = document.createElement("script");
    script.src = "https://pg-web.nicepay.co.kr/v3/common/js/nicepay-pgweb.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = () => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            insBgnDt: insuranceData.insBgnDt,
            insEdDt: insuranceData.insEdDt,
            natlCd: insuranceData.natlCd,
            inspeCnt: insuranceData.inspeCnt,
            contractInfos: insuranceData.contractInfos,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // setTotalPrice(data.ttPrem);
          setGroupNo(data.quotGrpNo);
          setReqNo(data.quotReqNo);

          window.AUTHNICE.requestPay({
            clientId: clientId,
            method: "cardAndEasyPay",
            orderId: orderId,
            amount: 100,
            goodsName: selectedPlanName || selectedData.name,
            buyer_name: propsUserDataAndCompanionData.name || "",
            buyer_tel: propsUserDataAndCompanionData.phoneNumber || "",
            returnUrl: `https://insudev.retrust.world/pay/serverAuth`,
            fnError: function (result) {
              alert("개발자확인용 : " + result.errorMsg + "");
            },
          });
        } else {
          console.error("Error:", data);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  };

  const getPlanCd = () => {
    if (priceData) {
      return (
        priceData.BASIC?.opapiGnrCoprCtrInspeInfCbcVo[0]?.planCd ||
        priceData.PREMIUM?.opapiGnrCoprCtrInspeInfCbcVo[0]?.planCd ||
        priceData.RECOMMEND?.opapiGnrCoprCtrInspeInfCbcVo[0]?.planCd ||
        null
      );
    } else {
      console.error("priceData가 존재하지 않습니다.");
      return null;
    }
  };

  // 사용자 기본 정보
  const userInfo = {
    planCd: getPlanCd(),
    inspeBdt: dateOfBirth || "",
    gndrCd: gender || "",
    inspeNm: propsUserDataAndCompanionData.name || "",
    engInspeNm: propsUserDataAndCompanionData.englishName || "",
    phone: propsUserDataAndCompanionData.phoneNumber || "",
    email: propsUserDataAndCompanionData.email || "",
  };

  // 동반자 정보 추가
  const companionInfos = companions.map((companion, index) => ({
    planCd: getPlanCd(),
    inspeBdt: companion.dateOfBirth || "",
    gndrCd: companion.gender || "",
    inspeNm: companionsName[index] || "",
    engInspeNm: companionsEngName[index] || "",
    inspeRsidNo: companionssecretNumber[index] || "",
    phone: companionsPhone[index] || "",
    email: companionsEmail[index] || "",
  }));

  // 사용자 정보와 동반자 정보를 합침
  const contractInfos = [userInfo, ...companionInfos];

  const insuranceData = {
    insBgnDt: startDate || "",
    insEdDt: endDate || "",
    natlCd: natlCds || "",
    inspeCnt: inspeCnts || 0,
    contractInfos: contractInfos,
  };

  return <Button buttonText="결제하기" onClick={handlePayment}></Button>;
}

export default Payment;
