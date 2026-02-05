import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import DptDateSelectModal from "./DptDateSelectModal";
import styles from "../../../css/trip/insert.module.css";
import { selectEndDate, selectStartDate } from "../../../redux/store";

function DptInsertDate({ faRetrustData }) {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("end"); // 출국 후는 도착일만 선택
  const startDate = useSelector((state) => state.calendar.selectedStartDate);
  const endDate = useSelector((state) => state.calendar.selectedEndDate);

  useEffect(() => {
    // 출국 후인 경우 현재 날짜를 출발일로 자동 설정
    const today = moment().format("YYYYMMDD");
    dispatch(selectStartDate(today));

    if (faRetrustData && faRetrustData.startDate) {
      dispatch(selectStartDate(faRetrustData.startDate));
    }
  }, [faRetrustData, dispatch]);

  useEffect(() => {
    if (faRetrustData && faRetrustData.endDate) {
      dispatch(selectEndDate(faRetrustData.endDate));
    }
  }, [faRetrustData, dispatch]);

  const handleModalOpen = (modalType) => {
    return () => {
      // 출국 후인 경우 출발일 선택 불가
      if (modalType === "start") {
        return;
      }
      setModalType(modalType);
      setShowModal(true);
    };
  };

  const formatDate = (date) => {
    if (!date) return "";
    return moment(date, "YYYYMMDD").isValid()
      ? moment(date, "YYYYMMDD").format("YYYY-MM-DD")
      : moment(date).format("YYYY-MM-DD");
  };

  const handleApply = () => {
    setShowModal(false);
  };

  return (
    <>
      <div className={styles.calendarBox}>
        <div className={styles.InputFlex}>
          <input
            value={formatDate(startDate)}
            placeholder="오늘 날짜"
            className={`${styles.InputContent} bg-gray-100`}
            readOnly
            disabled={true}
          />
          <input
            value={formatDate(endDate)}
            placeholder="도착일"
            className={styles.InputContent}
            onClick={handleModalOpen("end")}
            readOnly
          />
        </div>
      </div>
      <DptDateSelectModal
        isOpen={showModal}
        onClose={handleApply}
        isStartModal={false} // 항상 도착일 모달만 사용
        startDate={startDate}
        faRetrustData={faRetrustData}
      />
    </>
  );
}

export default DptInsertDate;
