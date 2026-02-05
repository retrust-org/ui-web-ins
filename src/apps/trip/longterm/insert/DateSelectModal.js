import React, { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { animated } from "react-spring";
import StartCalendar from "./StartCalendar";
import EndCalendar from "./EndCalender";
import styles from "../../../../css/trip/insert.module.css";

function DateSelectModal({
  isOpen,
  onClose,
  isStartModal,
  startDate,
  faRetrustData,
}) {
  const modalRef = useRef(null);

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      <animated.div
        className={`fixed inset-0 flex items-center justify-center z-[100] ${isOpen ? "" : "hidden"
          } duration-500 ease-in-out transition-opacity`}
      >
        <div className="bg-black bg-opacity-50 absolute inset-0"></div>
        <div
          ref={modalRef}
          className="commonModal bg-white rounded-t-[30px] overflow-hidden mx-auto z-10 w-[100%] py-4 px-5 fixed bottom-0 inset-x-0 animate-slideIn pb-4"
        >
          <div className="w-full flex justify-end">
            <button className="text-[1.6rem] text-[#353535] " onClick={handleClose}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <div className="flex w-[100%] px-2 justify-between mx-auto items-center pt-2 mb-[6px]">
            <p className={styles.calendarTtitle}>
              {isStartModal ? "출발일을 선택해주세요" : "도착일을 선택해주세요"}
            </p>
          </div>

          <p className="text-[#e86565] px-2 text-[13px] lg:pb-4">
            *이미 출국하여 해외 체류 중이신 경우 보험 가입 및 보장이
            불가능합니다.
          </p>

          <div className="">
            {isStartModal ? (
              <StartCalendar onClose={onClose} faRetrustData={faRetrustData} />
            ) : (
              <EndCalendar
                startDate={startDate}
                onClose={onClose}
                faRetrustData={faRetrustData}
              />
            )}
          </div>
          <div></div>
        </div>
      </animated.div>
    </>
  );
}

export default DateSelectModal;
