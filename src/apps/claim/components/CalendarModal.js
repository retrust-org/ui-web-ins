// components/claimComponents/CalendarModal.js

import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import dayjs from "dayjs";
import commonX from "../../../assets/commonX.svg";
import commonRightBig from "../../../assets/commonRightBig.svg";
import commonLeftSmall from "../../../assets/commonLeftSmall.svg";

const CalendarModal = ({
  open,
  onClose,
  onSelect,
  initialDate,
  minDate,
  maxDate,
  insuranceStartDate,
  insuranceEndDate,
  ableDate,
  showAbleDates = false,
  highlightNextDay = false,
  isExtendCalendar = false,
  closeOnSelect = true, // closeOnSelect prop 추가
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [isInitialized, setIsInitialized] = useState(false);
  const startDate = dayjs(insuranceStartDate);
  const endDate = dayjs(insuranceEndDate);
  const today = dayjs().startOf("day");
  const nextDay = endDate.add(1, "day");

  const canNavigateMonth = (direction) => {
    const nextMonth =
      direction === "next"
        ? currentMonth.add(1, "month")
        : currentMonth.subtract(1, "month");

    // 연장용 캘린더일 경우의 로직
    if (isExtendCalendar) {
      const maxMonth = startDate.add(3, "month").startOf("month");
      const minMonth = today.isBefore(startDate)
        ? startDate.startOf("month")
        : today.startOf("month");

      if (direction === "next") {
        return nextMonth.valueOf() <= maxMonth.valueOf();
      }
      return nextMonth.valueOf() >= minMonth.valueOf();
    }

    // 청구용 캘린더일 경우의 기존 로직
    if (!showAbleDates) {
      const minDateMonth = minDate ? dayjs(minDate).startOf("month") : null;
      const maxDateMonth = maxDate ? dayjs(maxDate).startOf("month") : null;

      if (direction === "next" && maxDateMonth) {
        return nextMonth.valueOf() <= maxDateMonth.valueOf();
      }
      if (direction === "prev" && minDateMonth) {
        return nextMonth.valueOf() >= minDateMonth.valueOf();
      }
    }

    return true;
  };

  const handleNextMonth = () => {
    if (canNavigateMonth("next")) {
      setCurrentMonth(currentMonth.add(1, "month"));
    }
  };

  const handlePrevMonth = () => {
    if (canNavigateMonth("prev")) {
      setCurrentMonth(currentMonth.subtract(1, "month"));
    }
  };

  const handleClose = (event, reason) => {
    if (reason === "backdropClick") {
      return;
    }
    onClose();
  };

  const isDateDisabled = (date) => {
    if (!isInitialized) return true;

    // 연장용 캘린더일 경우의 로직
    if (isExtendCalendar) {
      //최대 90일까지 선택가능
      const maxDate = startDate.add(90, "day");

      if (today.isBefore(startDate)) {
        // 개시전 보험일 경우,
        // 보험 개시일부터 선택 가능
        if (date.valueOf() < startDate.valueOf()) {
          return true;
        } else if (date.valueOf() === endDate.valueOf()) {
          return true;
        }
      } else {
        // 개시된 보험일 경우,
        // 당일부터 선택 가능
        return (
          date.valueOf() < today.valueOf() ||
          date.valueOf() > maxDate.valueOf() ||
          date.valueOf() === endDate.valueOf()
        );
      }
    }

    // 청구용 캘린더일 경우의 기존 로직
    if (!showAbleDates) {
      if (minDate && date.valueOf() < dayjs(minDate).valueOf()) return true;
      if (maxDate && date.valueOf() > dayjs(maxDate).valueOf()) return true;
    }

    if (showAbleDates && ableDate) {
      return !ableDate.includes(date.format("YYYY-MM-DD"));
    }

    return false;
  };

  useEffect(() => {
    let initialMonth;

    if (isExtendCalendar) {
      // 연장용 캘린더의 경우, 보험 종료일 다음 날짜로 초기화
      const endDateMonth = insuranceEndDate ? dayjs(insuranceEndDate) : null;
      const nextDay = dayjs(endDateMonth).add(1, "day");

      initialMonth = nextDay;
    } else {
      // 청구용 캘린더의 기존 로직
      if (initialDate) {
        initialMonth = dayjs(initialDate);
      } else if (minDate) {
        initialMonth = dayjs(minDate);
      } else {
        initialMonth = dayjs();
      }
    }

    setCurrentMonth(initialMonth.startOf("month"));
    setSelectedDate(null);

    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [initialDate, minDate, insuranceEndDate, isExtendCalendar]);

  const getMonthDays = () => {
    const daysInMonth = [];
    const firstDay = currentMonth.startOf("month").day();
    const daysInCurrentMonth = currentMonth.daysInMonth();

    for (let i = 0; i < firstDay; i++) {
      daysInMonth.push(null);
    }

    for (let i = 1; i <= daysInCurrentMonth; i++) {
      daysInMonth.push(i);
    }

    return daysInMonth;
  };

  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];

  const getDayColor = (dayIndex, isDisabled) => {
    if (dayIndex === 0) return "#E86565"; // 일요일
    if (dayIndex === 6) return "#6591E8"; // 토요일
    return isDisabled ? "rgba(27, 30, 40, 0.4)" : "#1B1E28";
  };

  const getNavigationButtonStyle = (direction) => ({
    opacity: canNavigateMonth(direction) ? 1 : 0.3,
    cursor: canNavigateMonth(direction) ? "pointer" : "not-allowed",
  });

  const isDateHighlighted = (date) => {
    if (highlightNextDay && insuranceEndDate) {
      return date.format("YYYY-MM-DD") === nextDay.format("YYYY-MM-DD");
    }
    return false;
  };

  const isAbleDate = (date) => {
    return (
      showAbleDates && ableDate && ableDate.includes(date.format("YYYY-MM-DD"))
    );
  };

  const isSelectedDate = (day) => {
    return (
      selectedDate &&
      selectedDate.date() === day &&
      selectedDate.month() === currentMonth.month()
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      sx={{
        "& .MuiDialog-container": {
          alignItems: "flex-end", // 컨테이너를 하단에 정렬
        },
        "& .MuiDialog-paper": {
          margin: 0,
          borderRadius: "40px 40px 0 0",
          overflow: "hidden",
        },
      }}
    >
      <Box
        display="flex"
        justifyContent="end"
        sx={{
          padding: "0 26px",
          marginTop: "20px",
        }}
      >
        <DialogActions onClick={handleClose} sx={{ padding: 0 }}>
          <Button color="secondary" sx={{ minWidth: "auto", padding: "8px" }}>
            <img src={commonX} alt="close" />
          </Button>
        </DialogActions>
      </Box>

      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="h6"
                sx={{
                  marginLeft: 1,
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#1B1E28",
                }}
              >
                {currentMonth.format("YYYY년 M월")}
              </Typography>
              <Box display="flex" alignItems="center">
                <IconButton
                  onClick={handlePrevMonth}
                  style={getNavigationButtonStyle("prev")}
                  disabled={!canNavigateMonth("prev")}
                >
                  <img src={commonLeftSmall} alt="previous" />
                </IconButton>
                <IconButton
                  onClick={handleNextMonth}
                  style={getNavigationButtonStyle("next")}
                  disabled={!canNavigateMonth("next")}
                >
                  <img src={commonRightBig} alt="next" />
                </IconButton>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} align="center">
            <Typography variant="subtitle1">
              <Grid container justifyContent="center" spacing={2}>
                {daysOfWeek.map((day, index) => (
                  <Grid item key={index} sx={{ width: "calc(100% / 7)" }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontSize: "16px",
                        fontWeight: 600,
                        lineHeight: "20px",
                        color: getDayColor(index),
                        marginTop: "20px",
                        paddingRight: "2px",
                      }}
                    >
                      {day}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Typography>
          </Grid>

          {getMonthDays().map((day, index) => (
            <Grid item xs={1.7} key={index}>
              {day ? (
                <Box
                  sx={{
                    position: "relative",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <Button
                    variant="text"
                    onClick={() => {
                      const newDate = currentMonth.date(day);
                      if (!isDateDisabled(newDate)) {
                        setSelectedDate(newDate);
                        // onSelect 함수가 존재하는지 확인하고 호출
                        if (typeof onSelect === "function") {
                          onSelect(newDate.toDate());
                          // closeOnSelect이 true인 경우에만 모달 닫기
                          if (closeOnSelect && typeof onClose === "function") {
                            onClose();
                          }
                        }
                      }
                    }}
                    disabled={isDateDisabled(currentMonth.date(day))}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      minWidth: "36px",
                      width: "36px",
                      height: "36px",
                      fontSize: "14px",
                      fontWeight: 600,
                      lineHeight: "20px",
                      color: (theme) => {
                        if (isDateHighlighted(currentMonth.date(day))) {
                          return "#FFFFFF";
                        }
                        return isSelectedDate(day)
                          ? "#FFFFFF"
                          : getDayColor(
                              dayjs(
                                new Date(
                                  currentMonth.year(),
                                  currentMonth.month(),
                                  day
                                )
                              ).day(),
                              isDateDisabled(currentMonth.date(day))
                            );
                      },
                      backgroundColor: (theme) => {
                        if (isDateHighlighted(currentMonth.date(day))) {
                          return "#386937";
                        }
                        return isSelectedDate(day)
                          ? "rgba(56, 105, 55, 0.8)"
                          : "transparent";
                      },
                      padding: 0,
                      borderRadius: "50%",
                      opacity: 0.8,
                      "&.Mui-disabled": {
                        color: (theme) =>
                          getDayColor(
                            dayjs(
                              new Date(
                                currentMonth.year(),
                                currentMonth.month(),
                                day
                              )
                            ).day(),
                            true
                          ),
                        opacity: 0.4,
                      },
                    }}
                  >
                    {day}
                  </Button>
                  {/* 종료일에 대한 dot 표시 */}
                  {currentMonth.date(day).valueOf() === endDate.valueOf() && (
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: "2px",
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: "#E86565",
                      }}
                    />
                  )}
                  {/* 기존 dot 표시 유지 */}
                  {isAbleDate(currentMonth.date(day)) &&
                    !isSelectedDate(day) && (
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: "2px",
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: "#386937",
                        }}
                      />
                    )}
                </Box>
              ) : null}
            </Grid>
          ))}
        </Grid>

        {/* 하단 설명 추가 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            marginTop: "16px",
            padding: "0 16px",
          }}
        >
          <Box
            sx={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#E86565",
              marginRight: "4px",
            }}
          />
          <Typography
            sx={{
              fontSize: "12px",
              color: "#666666",
              lineHeight: "16px",
            }}
          >
            도착일이 동일한 날짜로 선택할 수 없습니다
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarModal;
