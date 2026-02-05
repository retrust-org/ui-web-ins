// ClaimCalendar.js
import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Typography } from "@mui/material";
import commonCalendar from "../../../assets/commonCalendar.svg";
import CalendarModal from "./CalendarModal";

const ClaimCalendar = ({
  onSelect,
  initialDate,
  disabled = false,
  claimableContracts,
  encryptedRRN,
  ableDate,
  setSelectedContractId,
  closeOnSelect = true, // 기본값은 true로 설정
  ...props
}) => {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    initialDate ? dayjs(initialDate) : null
  );

  const findMatchingContract = (selectedDay, contracts) => {
    return contracts?.find(
      (contract) =>
        selectedDay.isSame(dayjs(contract.insurance_start_date), "day") ||
        selectedDay.isSame(dayjs(contract.insurance_end_date), "day") ||
        (selectedDay.isAfter(dayjs(contract.insurance_start_date)) &&
          selectedDay.isBefore(dayjs(contract.insurance_end_date)))
    );
  };

  const handleOpen = () => {
    if (!disabled) {
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClaimSelect = (date) => {
    // onSelect가 함수인지 확인
    if (typeof date !== "undefined" && date !== null) {
      const selectedDay = dayjs(date);
      setSelectedDate(selectedDay);

      if (Array.isArray(claimableContracts) && claimableContracts?.length > 0) {
        const matchingContract = findMatchingContract(
          selectedDay,
          claimableContracts
        );
        if (matchingContract && setSelectedContractId) {
          setSelectedContractId(matchingContract.contract_id);
        }
      }

      // onSelect가 함수인지 확인
      if (typeof onSelect === "function") {
        onSelect(date);
      } else {
        console.warn("onSelect is not a function in ClaimCalendar");
      }
    }
  };

  useEffect(() => {
    if (initialDate) {
      setSelectedDate(dayjs(initialDate));
    }
  }, [initialDate]);

  return (
    <div
      className={`bg-[#F3F4F6] flex w-full rounded-xl ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <div
        className="flex gap-2 items-center px-[16px] py-[18px] w-full cursor-pointer"
        onClick={handleOpen}
      >
        <img
          src={commonCalendar}
          className={`text-2xl ${disabled ? "pointer-events-none" : ""}`}
          alt="Open calendar"
        />
        <Typography variant="h6" className="w-full">
          <p
            className={`text-[14px] lg:text-[16px] ${
              selectedDate ? "text-[#1B1E28]" : "text-[#96989c]"
            } font-normal`}
          >
            {selectedDate
              ? selectedDate.format("YYYY-MM-DD")
              : "청구일자를 선택해주세요."}
          </p>
        </Typography>
      </div>
      <CalendarModal
        open={open}
        onClose={handleClose}
        onSelect={handleClaimSelect}
        initialDate={initialDate}
        disabled={disabled}
        ableDate={ableDate}
        showAbleDates={true}
        isExtendCalendar={false}
        closeOnSelect={closeOnSelect} // closeOnSelect prop을 CalendarModal에 전달
        {...props}
      />
    </div>
  );
};

export default ClaimCalendar;
