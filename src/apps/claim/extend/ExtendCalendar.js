import React from "react";
import dayjs from "dayjs";
import { Typography } from "@mui/material";
import commonCalendar from "../../../assets/commonCalendar.svg";
import CalendarModal from "../components/CalendarModal";

const ExtendCalendar = ({
  onSelect,
  initialDate,
  insuranceStartDate,
  insuranceEndDate,
  disabled = false,
}) => {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(
    initialDate ? dayjs(initialDate) : null
  );

  React.useEffect(() => {
    if (initialDate) {
      setSelectedDate(dayjs(initialDate));
    }
  }, [initialDate]);

  const handleOpen = () => {
    if (!disabled) {
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDateSelect = (date) => {
    const selectedDay = dayjs(date);
    setSelectedDate(selectedDay);
    onSelect(date);
    handleClose();
  };

  return (
    <div
      className={`bg-[#F3F4F6] flex w-full rounded-xl ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <div
        onClick={handleOpen}
        className={`flex gap-2 items-center p-4 cursor-pointer ${
          disabled ? "pointer-events-none" : ""
        }`}
      >
        <img src={commonCalendar} className="text-2xl" alt="Open calendar" />
        <Typography variant="h6">
          <p
            className={`text-[14px] lg:text-[16px] ${
              selectedDate ? "text-[#1B1E28]" : "text-[#96989c]"
            } font-normal`}
          >
            {selectedDate
              ? selectedDate.format("YYYY-MM-DD")
              : disabled
              ? "출발일"
              : "도착일을 선택해주세요."}
          </p>
        </Typography>
      </div>
      <CalendarModal
        open={open}
        onClose={handleClose}
        onSelect={handleDateSelect}
        initialDate={initialDate}
        insuranceStartDate={insuranceStartDate}
        insuranceEndDate={insuranceEndDate}
        isExtendCalendar={true}
        highlightNextDay={true}
      />
    </div>
  );
};

export default ExtendCalendar;
