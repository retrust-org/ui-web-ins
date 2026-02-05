import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers";
import "dayjs/locale/ko";
import dayjs from "dayjs";
import { selectStartDate } from "../../../redux/store";

const DptStartCalendar = ({ onClose, faRetrustData }) => {
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const today = dayjs();
  const minDate = today;
  const maxDate = today;
  const primaryColor = "#0E98F6";

  useEffect(() => {
    // 현재 날짜로 설정
    setSelectedDate(today);
    dispatch(selectStartDate(today.format("YYYYMMDD")));

    if (faRetrustData?.startDate) {
      const startDate = dayjs(faRetrustData.startDate);
      setSelectedDate(startDate);
      dispatch(selectStartDate(startDate.format("YYYYMMDD")));
    }
  }, [faRetrustData, dispatch, today]);

  const shouldDisableDate = (day) => {
    // 오늘 날짜만 선택 가능
    return !day.isSame(today, "day");
  };

  const getDayStyle = (date) => {
    const day = date.day();
    if (day === 0) return { color: "#e86565" }; // 일요일
    if (day === 6) return { color: "#6591e8" }; // 토요일
    return {};
  };

  const handleApply = () => {
    if (selectedDate) {
      const formattedDate = selectedDate.format("YYYYMMDD");
      dispatch(selectStartDate(formattedDate));
      onClose(selectedDate);
    } else {
      alert("선택된 날짜가 없습니다!");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
      <div className="w-full max-w-[440px] mx-auto bg-white rounded-2xl overflow-hidden">
        <div className="calendar-wrapper">
          <DateCalendar
            value={selectedDate}
            onChange={setSelectedDate}
            shouldDisableDate={shouldDisableDate}
            showDaysOutsideCurrentMonth={false}
            minDate={minDate}
            maxDate={maxDate}
            views={["month", "day"]}
            slotProps={{
              day: (ownerState) => ({
                sx: getDayStyle(ownerState.day),
              }),
            }}
            sx={{
              width: "100%",
              height: "330px",
              // 헤더 (년도/월) 스타일링
              "& .MuiPickersCalendarHeader-root": {
                display: "flex",
                alignItems: "center",
                margin: "8px 0",
                padding: "0px",
                position: "relative",
                width: "100%",
              },
              "& .MuiPickersCalendarHeader-label": {
                fontSize: {
                  xs: "1.25rem",
                  sm: "1.25rem",
                },
                fontWeight: 600,
                margin: "0 10px",
                textAlign: "left",
                color: "#333",
                position: "static",
                flex: 1,
              },
              // 이전/다음 달 버튼 수정
              "& .MuiPickersArrowSwitcher-root": {
                display: "flex",
                justifyContent: "flex-end",
                gap: "4px",
                width: "auto",
              },
              "& .MuiPickersArrowSwitcher-button": {
                color: "#1b1e28",
                padding: "8px",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
                "& svg": {
                  width: "24px",
                  height: "24px",
                },
              },
              // 요일 헤더
              "& .MuiDayCalendar-header": {
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                margin: "0",
              },
              // 요일 레이블
              "& .MuiDayCalendar-weekDayLabel": {
                width: {
                  xs: "36px",
                  sm: "40px",
                },
                height: {
                  xs: "36px",
                  sm: "40px",
                },
                margin: "0",
                fontSize: {
                  xs: "0.75rem",
                  sm: "0.875rem",
                },
                fontWeight: 600,
                color: "#666",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "&:last-of-type": {
                  color: "#6591e8",
                },
                "&:first-of-type": {
                  color: "#e86565",
                },
              },
              // 날짜 셀
              "& .MuiPickersDay-root": {
                width: {
                  xs: "36px",
                  sm: "40px",
                },
                height: {
                  xs: "36px",
                  sm: "40px",
                },
                margin: "0",
                fontSize: {
                  xs: "0.8rem",
                  sm: "0.875rem",
                },
                fontWeight: 500,
                padding: 0,
                "&:hover": {
                  backgroundColor: `${primaryColor}20`,
                },
                "&.Mui-selected": {
                  backgroundColor: primaryColor,
                  color: "white !important",
                  "&:hover": {
                    backgroundColor: primaryColor,
                  },
                  "&:focus": {
                    backgroundColor: primaryColor,
                  },
                },
                "&.Mui-disabled": {
                  "&:nth-of-type(7n)": {
                    color: "#6591e8 !important",
                    opacity: "0.3",
                  },
                  "&:nth-of-type(7n + 1)": {
                    color: "#e86565 !important",
                    opacity: "0.3",
                  },
                  "&:not(:nth-of-type(7n)):not(:nth-of-type(7n+1))": {
                    color: "#ccc !important",
                  },
                },
              },
              // 캘린더 컨테이너
              "& .MuiDayCalendar-monthContainer": {
                margin: "0 auto",
                width: "100%",
              },
              "& .MuiDayCalendar-weekContainer": {
                margin: "0",
                display: "flex",
                justifyContent: "space-between",
              },
              // 뷰 전환 버튼 숨기기
              "& .MuiPickersCalendarHeader-switchViewButton": {
                display: "none",
              },
              // 캘린더 높이 관련
              "& .MuiDateCalendar-root": {
                height: "320px !important",
                maxHeight: "320px !important",
              },
              "& .MuiPickersSlideTransition-root": {
                minHeight: "240px !important",
                maxHeight: "240px !important",
              },
            }}
          />
        </div>

        <div className="w-full">
          <div className="border-t border-gray-200"></div>
          <div className="flex justify-between items-center py-3 sm:py-4">
            <span className="text-sm lg:text-[1rem] font-normal text-[#333]">
              출발일
            </span>
            <span className="text-sm lg:text-[1rem] font-normal text-[#333]">
              {selectedDate
                ? selectedDate.format("YYYY년 MM월 DD일")
                : "날짜를 선택해주세요"}
            </span>
          </div>
        </div>

        <div className="pb-4">
          <button
            className="w-full py-3 sm:py-4 rounded-xl text-white font-semibold text-[13px] sm:text-sm transition-all duration-200 hover:opacity-90 active:transform active:scale-[0.98]"
            style={{ backgroundColor: primaryColor }}
            onClick={handleApply}
          >
            적용
          </button>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default DptStartCalendar;
