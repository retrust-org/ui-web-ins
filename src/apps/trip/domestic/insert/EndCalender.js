import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import Badge from "@mui/material/Badge";
import "dayjs/locale/ko";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { selectEndDate } from "../../../../redux/store";

// dayjs 플러그인 등록
dayjs.extend(isSameOrBefore);

const EndCalendar = ({ onClose, faRetrustData }) => {
  const dispatch = useDispatch();
  const startDate = useSelector((state) => state.calendar.selectedStartDate);
  const [selectedDate, setSelectedDate] = useState(null);
  const primaryColor = "#386937";

  // 사용자 선택 여부 추적
  const [userSelected, setUserSelected] = useState(false);

  // 출발일이 변경될 때 기본 선택 날짜 설정
  useEffect(() => {
    if (startDate) {
      const startMoment = dayjs(startDate, "YYYYMMDD");

      // 사용자가 날짜를 직접 선택하지 않았으면 출발일로 설정 (당일 선택 가능)
      if (!userSelected) {
        setSelectedDate(startMoment);
        dispatch(selectEndDate(startMoment.format("YYYYMMDD")));
      }
    }
  }, [startDate, dispatch, userSelected]);

  // 날짜 비활성화 로직 - 출발일부터 60일까지 선택 가능
  const shouldDisableDate = (day) => {
    if (!startDate) {
      return true;
    }

    const dayToCheck = dayjs(day);
    const startMoment = dayjs(startDate, "YYYYMMDD");

    // 출발일 이전 날짜는 비활성화
    if (dayToCheck.isBefore(startMoment, "day")) {
      return true;
    }

    // 출발일 기준 60일(2개월) 초과 날짜는 비활성화
    const twoMonthsDate = startMoment.add(60, "day");
    if (dayToCheck.isAfter(twoMonthsDate, "day")) {
      return true;
    }

    return false;
  };

  const handleApply = () => {
    if (selectedDate) {
      dispatch(selectEndDate(selectedDate.format("YYYYMMDD")));
      onClose(selectedDate.format("YYYYMMDD"));
    }
  };

  // 날짜 렌더링 커스텀 컴포넌트
  const ServerDay = (props) => {
    const { day, outsideCurrentMonth, ...other } = props;

    // 해당 날짜가 출발일인지 체크
    const isStartDate =
      startDate && dayjs(day).isSame(dayjs(startDate, "YYYYMMDD"), "day");

    const dayOfWeek = day.day();

    let dayStyle = { color: "#333" };
    if (dayOfWeek === 0) dayStyle.color = "#e86565"; // 일요일
    if (dayOfWeek === 6) dayStyle.color = "#6591e8"; // 토요일

    // 현재 월 외의 날짜는 기본 PickersDay로 렌더링
    if (outsideCurrentMonth) {
      return (
        <PickersDay
          {...other}
          outsideCurrentMonth={outsideCurrentMonth}
          day={day}
        />
      );
    }

    return (
      <Badge
        key={day.toString()}
        overlap="rectangular"
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        badgeContent={
          isStartDate ? (
            <span className="text-[12px] top-[-14px] font-normal text-black relative right-5 tracking-tighter w-[40px] text-center h-0">
              출발일
            </span>
          ) : undefined
        }
      >
        <PickersDay
          {...other}
          outsideCurrentMonth={outsideCurrentMonth}
          day={day}
          sx={{
            ...dayStyle,
            "&.Mui-disabled": {
              color: `${dayStyle.color} !important`,
              opacity: 0.3,
            },
            "&.Mui-selected": {
              backgroundColor: `${primaryColor} !important`,
              color: "white !important",
              "&:hover": {
                backgroundColor: primaryColor,
              },
              "&:focus": {
                backgroundColor: primaryColor,
              },
            },
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
          }}
        />
      </Badge>
    );
  };

  // 출발일 기준 2개월(60일)까지의 maxDate 계산
  const getMaxDate = () => {
    if (startDate) {
      const startMoment = dayjs(startDate, "YYYYMMDD");
      return startMoment.add(60, "day");
    }
    return dayjs().add(60, "day");
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
      <div className="w-full max-w-[440px] mx-auto bg-white rounded-2xl">
        <div className="calendar-wrapper">
          <DateCalendar
            value={selectedDate}
            onChange={(newDate) => {
              // 사용자가 날짜를 직접 선택했음을 표시
              setUserSelected(true);
              setSelectedDate(newDate);
              dispatch(selectEndDate(newDate.format("YYYYMMDD")));
            }}
            shouldDisableDate={shouldDisableDate}
            showDaysOutsideCurrentMonth={false}
            maxDate={getMaxDate()}
            views={["month", "day"]}
            slots={{
              day: ServerDay,
            }}
            sx={{
              width: "100%",
              height: "380px", // 캘린더 전체 높이 증가
              "& .MuiPickersCalendarHeader-root": {
                display: "flex",
                alignItems: "center",
                margin: "12px 0", // 상하 마진 증가
                padding: "0px",
                position: "relative",
                width: "100%",
                paddingLeft: "12px",
              },
              "& .MuiPickersCalendarHeader-label": {
                fontSize: {
                  xs: "1.25rem",
                  sm: "1.25rem",
                },
                fontWeight: 600,
                margin: "0",
                textAlign: "left",
                color: "#333",
                position: "static",
                flex: 1,
              },
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
              "& .MuiDayCalendar-header": {
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                margin: "8px 0",
              },
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
              "& .MuiDayCalendar-monthContainer": {
                margin: "0 auto",
                width: "100%",
                overflow: "visible",
              },
              "& .MuiDayCalendar-weekContainer": {
                margin: "8px 0", // 상하 마진 추가
                display: "flex",
                justifyContent: "space-between",
              },
              "& .MuiPickersCalendarHeader-switchViewButton": {
                display: "none",
              },
              "& .MuiDateCalendar-root": {
                height: "380px !important", // 캘린더 높이 증가z
                maxHeight: "380px !important",
              },
              "& .MuiPickersSlideTransition-root": {
                minHeight: "310px !important",
                maxHeight: "310px !important",
                overscrollBehavior: "none",
                overflow: "visible", // 스크롤바 자체를 숨김
                msOverflowStyle: "none", // IE와 Edge에서 스크롤바 숨김
                scrollbarWidth: "none", // Firefox에서 스크롤바 숨김
                "&::-webkit-scrollbar": {
                  display: "none", // Chrome, Safari, Opera에서 스크롤바 숨김
                },
              },
            }}
          />
        </div>

        <div className="w-full">
          <div className="border-t border-gray-200"></div>
          <div className="flex justify-between items-center py-3 sm:py-4">
            <span className="text-sm lg:text-[1rem] font-normal text-[#333]">
              선택한 날짜
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
            disabled={!selectedDate}
          >
            적용
          </button>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default EndCalendar;
