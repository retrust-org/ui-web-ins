// ClaimSelectDate.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../../css/claim/claimSelectDate.module.css";
import ClaimCalendar from "../components/ClaimCalendar";
import ClaimHeader from "../components/ClaimHeader";
import ClaimButton from "../../../components/buttons/ClaimButton";
import Loading from "../../../components/loadings/Loading";
import { useClaimUploadContext } from "../../../context/ClaimUploadContext";

function ClaimSelectDate({ handleDateSelect, setSelectedContractId }) {
  const navigate = useNavigate();
  const { claimData, saveSelectedDate, allContractData, receiptType } =
    useClaimUploadContext();

  console.log(receiptType);
  const [ableDate, setAbleDate] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [claimableContracts, setClaimableContracts] = useState([]);
  const productName = claimData?.product_name;

  console.log(allContractData, "contract all data");

  // Context 데이터를 이용한 날짜 계산
  useEffect(() => {
    const calculateDates = () => {
      if (!productName || !allContractData?.claimableContracts) {
        navigate("/claimTypeSelect");
        return;
      }

      setIsLoading(true);

      try {
        // 선택된 보험 상품과 일치하는 계약들만 필터링 (통합된 데이터 사용)
        const filteredContracts = allContractData.claimableContracts.filter(
          (contract) => contract.product_name === productName
        );

        // 필터링된 계약 데이터 저장
        setClaimableContracts(filteredContracts);

        // 필터링된 계약이 없는 경우
        if (filteredContracts.length === 0) {
          console.warn("선택된 상품에 해당하는 계약이 없습니다.");
          setAbleDate([]);
          setIsLoading(false);
          return;
        }

        // 모든 매칭된 계약의 날짜를 합쳐서 계산
        const allDates = new Set();

        filteredContracts.forEach((contract) => {
          const startDate = new Date(contract.insurance_start_date);
          const endDate = new Date(contract.insurance_end_date);

          // 시작 날짜부터 종료 날짜까지 모든 날짜 추가
          for (
            let currentDate = new Date(startDate);
            currentDate <= endDate;
            currentDate.setDate(currentDate.getDate() + 1)
          ) {
            allDates.add(new Date(currentDate).toISOString().split("T")[0]);
          }
        });

        const sortedDates = Array.from(allDates).sort();

        setAbleDate(sortedDates);
        setIsLoading(false);
      } catch (error) {
        console.error("Error calculating dates:", error);
        setAbleDate([]);
        setClaimableContracts([]);
        setIsLoading(false);
      }
    };

    calculateDates();
  }, [productName, allContractData, navigate]);

  // 날짜 선택 핸들러
  const onDateSelect = (date) => {
    if (date) {
      // 내부 상태 업데이트
      setSelectedDate(date);

      // Date 객체를 YYYYMMDD 형식의 문자열로 변환
      const formattedDate = formatDateToYYYYMMDD(date);

      // Context에 날짜만 저장 (contract_id는 handleContractSelect에서 처리)
      const updateData = {
        ...claimData,
        accident_date: formattedDate,
      };

      // selectedProduct 제거 (있다면)
      delete updateData.selectedProduct;

      saveSelectedDate(updateData);

      // 기존 props 호환성 유지
      if (typeof handleDateSelect === "function") {
        handleDateSelect(date);
      }
    }
  };

  // Date 객체를 YYYYMMDD 형식으로 변환하는 함수
  const formatDateToYYYYMMDD = (date) => {
    const d = new Date(date);
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return year + month + day;
  };

  // 계약 선택 핸들러 - ClaimCalendar에서 호출됨 (캘린더에서 선택된 정확한 contract_id)
  const handleContractSelect = (contractId) => {
    if (contractId) {
      // 선택된 contract_id에 해당하는 계약 찾기
      const selectedContract = claimableContracts.find(
        (contract) => contract.contract_id === contractId
      );

      // 기존 데이터는 유지하고 contract_id만 추가/업데이트
      const updatedData = {
        ...claimData,
        contract_id: contractId,
      };

      // selectedProduct 제거 (있다면)
      delete updatedData.selectedProduct;

      if (
        selectedContract &&
        selectedContract.claimableChilds &&
        selectedContract.claimableChilds.length > 0
      ) {
        updatedData.claimableChilds = selectedContract.claimableChilds;
      }

      saveSelectedDate(updatedData);
    }

    // 기존 props 호환성 유지
    if (typeof setSelectedContractId === "function") {
      setSelectedContractId(contractId);
    }
  };

  // 다음 버튼 클릭 핸들러
  const handleNextClick = () => {
    if (!selectedDate) {
      alert("사고일자를 선택해주세요.");
      return;
    }

    // contract_id 확인
    if (!claimData?.contract_id) {
      alert("계약 정보가 없습니다. 날짜를 다시 선택해주세요.");
      return;
    }

    // 다음 페이지 결정 로직
    const selectedProduct = claimData?.product_name;

    // 국내여행보험 또는 해외장기체류보험인 경우 /claimAnnounce로 이동
    if (
      selectedProduct === "국내여행보험" ||
      selectedProduct === "해외장기체류보험" ||
      receiptType === "minorChild"
    ) {
      navigate("/claimAnnounce");
    } else {
      // 그 외의 경우 (해외여행보험 등) /accidentAccept로 이동
      navigate("/accidentAccept");
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  // 보험 정보가 없는 경우 경고 메시지 표시
  if (!productName) {
    return (
      <div className={styles.pageContainer}>
        <ClaimHeader titleText="청구하기" />
        <div className={styles.container}>
          <p className={styles.title}>보험을 먼저 선택해주세요</p>
          <ClaimButton
            buttonText="이전으로"
            onClick={() => navigate("/claimTypeSelect")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <ClaimHeader titleText="청구하기" />
      <div className={styles.container}>
        <p className={styles.title}>사고일자를 선택해주세요</p>
        <div className={styles.calendarContainer}>
          <div className={styles.calendarWrapper}>
            <ClaimCalendar
              onSelect={onDateSelect}
              initialDate={selectedDate}
              ableDate={ableDate}
              claimableContracts={claimableContracts}
              setSelectedContractId={handleContractSelect}
              showAbleDates={true}
              closeOnSelect={true}
            />
          </div>
        </div>
      </div>

      <ClaimButton
        buttonText="다음"
        disabled={!selectedDate}
        onClick={handleNextClick}
      />
    </div>
  );
}

export default ClaimSelectDate;
