import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import styles from "../../../css/trip/insert.module.css";
import { selectEndDate, selectStartDate } from "../../../redux/store";
import DateSelectModal from "./DateSelectModal";

function InsertDate({ faRetrustData }) {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("start");
  const endInputRef = useRef(null);
  const startDate = useSelector((state) => state.calendar.selectedStartDate);
  const endDate = useSelector((state) => state.calendar.selectedEndDate);

  useEffect(() => {
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
    if (modalType === "start") {
      setShowModal(false);
      // 출국 전인 경우 도착일 선택 모달 자동 오픈
      setModalType("end");
      setShowModal(true);

      if (moment(startDate).isAfter(moment(endDate))) {
        endInputRef.current.value = "";
      }
    } else {
      setShowModal(false);
    }
  };

  return (
    <>
      <div className={styles.calendarBox}>
        <div className={styles.InputFlex}>
          <input
            value={formatDate(startDate)}
            placeholder="출발일"
            className={styles.InputContent}
            onClick={handleModalOpen("start")}
            readOnly
          />
          <input
            ref={endInputRef}
            value={formatDate(endDate)}
            placeholder="도착일"
            className={styles.InputContent}
            onClick={handleModalOpen("end")}
            readOnly
          />
        </div>
      </div>
      <DateSelectModal
        isOpen={showModal}
        onClose={handleApply}
        isStartModal={modalType === "start"}
        startDate={startDate}
        faRetrustData={faRetrustData}
      />
    </>
  );
}

export default InsertDate;
