import React, { useState, useRef } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers";
import "dayjs/locale/ko";
import dayjs from "dayjs";

const InsuranceDatePicker = ({ onDateSelect, onClose, initialDate }) => {
  const today = dayjs();
  const minDate = today.add(7, 'day');
  const maxDate = today.add(7, 'day').add(1, 'month');

  const [selectedDate, setSelectedDate] = useState(() => {
    if (initialDate) {
      return dayjs(initialDate, "YYYYMMDD");
    }
    return minDate;
  });

  const primaryColor = "#386937";
  const calendarRef = useRef(null);

  const shouldDisableDate = (day) => {
    const dayMoment = dayjs(day);
    return dayMoment.isBefore(minDate, 'day') || dayMoment.isAfter(maxDate, 'day');
  };

  const getDayStyle = (date) => {
    const day = date.day();
    if (day === 0) return { color: "#e86565" };
    if (day === 6) return { color: "#6591e8" };
    return {};
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const handleApply = () => {
    if (selectedDate) {
      const formattedDate = selectedDate.format("YYYYMMDD");
      const endDate = selectedDate.add(1, 'year').format("YYYYMMDD");
      onDateSelect({
        startDate: formattedDate,
        endDate: endDate
      });
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
      <div
        ref={calendarRef}
        style={{ outline: 'none' }}
        tabIndex={-1}
      >
        <DateCalendar
          value={selectedDate}
          onChange={handleDateChange}
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
            height: "auto !important",
            maxHeight: "none !important",
            "& .MuiPickersCalendarHeader-root": {
              display: "flex",
              alignItems: "center",
              margin: "8px 0",
              padding: "0px",
              position: "relative",
              width: "100%",
              paddingLeft: "12px",
            },
            "& .MuiPickersCalendarHeader-label": {
              fontSize: "1.25rem",
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
              width: "40px",
              height: "40px",
              margin: "0",
              fontSize: "0.875rem",
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
            "& .MuiPickersDay-root": {
              width: "40px",
              height: "40px",
              margin: "2px 0",
              fontSize: "0.875rem",
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
            "& .MuiDayCalendar-monthContainer": {
              margin: "0 auto",
              width: "100%",
            },
            "& .MuiDayCalendar-weekContainer": {
              margin: "2px 0",
              display: "flex",
              justifyContent: "space-between",
            },
            "& .MuiPickersCalendarHeader-switchViewButton": {
              display: "none",
            },
            "& .MuiPickersSlideTransition-root": {
              overflow: "hidden",
            },
          }}
        />

        {/* 버튼 영역 */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={handleApply}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: primaryColor,
              color: '#fff',
              fontSize: '0.938rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            적용
          </button>
          <button
            onClick={handleCancel}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              backgroundColor: '#fff',
              color: '#374151',
              fontSize: '0.938rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            취소
          </button>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default InsuranceDatePicker;
