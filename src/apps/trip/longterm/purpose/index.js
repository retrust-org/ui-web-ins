import React, { useState } from "react";
import styles from "../../../../css/longterm/purpose.module.css";
import purposeTrip from "../../../../assets/purposeTrip.svg";
import purposeWork from "../../../../assets/purpose_work.svg";
import purposeStudy from "../../../../assets/purposeStudy.svg";
import purposeFamily from "../../../../assets/purposeFamily.svg";
import DownArrow from "../../../../assets/commonDownArrow.svg";
import Button from "../../../../components/buttons/Button";
import { useNavigate } from "react-router-dom";
import { setPurpose } from "../../../../redux/store";
import { useDispatch } from "react-redux";
import CheckList from "./CheckList";

function Purpose() {
  const [select, setSelect] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 처음부터 열려있도록 true로 변경
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(true);

  // CheckList 모달 상태
  const [isCheckListOpen, setIsCheckListOpen] = useState(false);

  const nextBtn = () => {
    if (select) {
      dispatch(setPurpose(select));
      // 다음 버튼 클릭 시 CheckList 모달 열기
      setIsCheckListOpen(true);
    }
  };

  const handleSelect = (option) => {
    setSelect(option);
  };

  const toggleAnnouncement = () => {
    setIsAnnouncementOpen(!isAnnouncementOpen);
  };

  // CheckList 모달 닫기 함수
  const closeCheckList = () => {
    setIsCheckListOpen(false);
  };

  return (
    <>
      <div className={styles.section}>
        <div className={styles.container}>
          <div className={styles.title}>
            <h1>
              <span>여행 목적</span>을 선택해주세요
            </h1>
          </div>
          <div className={styles.purposeGrid}>
            <div className={styles.topRow}>
              <div
                className={`${styles.purposeOption} ${
                  select === "TOUR" ? styles.selected : ""
                }`}
                onClick={() => handleSelect("TOUR")}
              >
                <div className={styles.optionContent}>
                  <p>여행/관광</p>
                  <img src={purposeTrip} alt="purposeTrip" />
                </div>
              </div>
              <div
                className={`${styles.purposeOption} ${
                  select === "WORK" ? styles.selected : ""
                }`}
                onClick={() => handleSelect("WORK")}
              >
                <div className={styles.optionContent}>
                  <p>업무/출장/주재원</p>
                  <img src={purposeWork} alt="purposeWork" />
                </div>
              </div>
            </div>

            <div className={styles.bottomRow}>
              <div
                className={`${styles.purposeOption} ${
                  select === "STUDY" ? styles.selected : ""
                }`}
                onClick={() => handleSelect("STUDY")}
              >
                <div className={styles.optionContent}>
                  <p>유학/연수/캠프</p>
                  <img src={purposeStudy} alt="purposeStudy" />
                </div>
              </div>

              <div
                className={`${styles.purposeOption} ${
                  select === "FAMILY" ? styles.selected : ""
                }`}
                onClick={() => handleSelect("FAMILY")}
              >
                <div className={styles.optionContent}>
                  <p>주재원 가족</p>
                  <img src={purposeFamily} alt="purposeFamily" />
                </div>
              </div>
            </div>
            <div className={styles.lineWrap}>
              <div className={styles.line}></div>
            </div>
          </div>
          <div className={styles.announceWrap}>
            <div className={styles.announceContainer}>
              <div
                className={styles.checkAnnounce}
                onClick={toggleAnnouncement}
              >
                <p>꼭 확인해주세요</p>
                <img
                  src={DownArrow}
                  alt="DownArrow"
                  className={isAnnouncementOpen ? styles.rotateArrow : ""}
                />
              </div>
              <ul
                className={
                  isAnnouncementOpen
                    ? styles.showAnnouncement
                    : styles.hideAnnouncement
                }
              >
                <li>
                  -업무/출장/주재원 목적은 업무 및 출장 또는 주재원으로 근무하는
                  당사자가 주계약자 또는 동반인으로 함께 가입하는 경우에 한해
                  선택 가능합니다.
                </li>
                <li>
                  -워킹홀리데이, wwoof 등 현장근무를 동반하는 여행인 경우
                  유학/연수/캠프 목적으로 가입하실 수 없습니다.
                </li>
                <li>
                  -주재원 가족 목적은 업무나 출장을 가거나 주재원으로 근무하는
                  당사자를 제외한 가족이 가입하는 경우 선택 가능합니다.
                </li>
              </ul>
            </div>
          </div>
        </div>
        <Button
          buttonText="다음"
          onClick={nextBtn}
          disabled={select === null}
        />

        {/* CheckList 컴포넌트에 isOpen과 onClose props 전달 */}
        <CheckList isOpen={isCheckListOpen} onClose={closeCheckList} />
      </div>
    </>
  );
}

export default Purpose;
