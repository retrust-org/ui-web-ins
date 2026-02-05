import React, { useState } from "react";
import styles from "../../../../css/longterm/checklist.module.css";
import modalLayOut from "../../../../css/common/modalLayOut.module.css";
import cancel from "../../../../assets/commonX.svg";
import rightArrow from "../../../../assets/rightArrow.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

function CheckList({ isOpen, onClose }) {
  const navigate = useNavigate();

  // 동의 항목 데이터
  const agreeItems = [
    {
      title: "보장내용에 대한 사항",
      contents: [
        "해외여행보험은 상해사망, 후유장해를 기본계약으로 하여 계약자가 필요한 담보를 선택하여 가입할 수 있습니다.",
        "질병이력이 있는 경우에도 해외여행보험을 가입할 수 있으나 질병이력과 관련된 담보의 경우에는 가입이 제한될 수 있습니다.",
        "실손의료보험에 이미 가입했다면 국내의료비 보장은 가입의 실익이 낮습니다.",
      ],
    },
    {
      title: "여행 국가에 대한 사항",
      contents: [
        "외교통상부(www.0404.go.kr)가 지정하는 지역별 여행정보 신호등 중 적색경보(철수권고), 흑색경보(여행금지) 지역은 보험가입과 보상이 불가능합니다.",
      ],
    },
  ];

  // 체크박스 상태 관리
  const [agrees, setAgrees] = useState(
    new Array(agreeItems.length).fill(false)
  );
  const [isAllAgreed, setIsAllAgreed] = useState(false);

  // 체크박스 스타일 함수
  const getCheckIconStyle = (isChecked) => {
    if (isChecked) {
      return {
        background: "#386937",
        color: "#FFFFFF",
        border: "1px solid #386937",
      };
    }

    return {
      background: "#E8E9EA",
      color: "#B8B9BC",
      border: "1px solid #E8E9EA",
    };
  };

  // 전체동의 토글 함수
  const toggleAllCheck = () => {
    const newAllAgreedState = !isAllAgreed;
    setIsAllAgreed(newAllAgreedState);
    setAgrees(new Array(agreeItems.length).fill(newAllAgreedState));
  };

  // 개별 동의 체크 함수
  const toggleAgreement = (index) => {
    const updatedAgrees = [...agrees];
    updatedAgrees[index] = !updatedAgrees[index];
    setAgrees(updatedAgrees);

    // 모든 항목이 체크되었는지 확인하여 전체동의 상태 업데이트
    setIsAllAgreed(updatedAgrees.every((agreement) => agreement));
  };

  // 모든 항목 동의 여부 확인
  const isAllItemsAgreed = agrees.every((agreement) => agreement);

  // 닫기 버튼 핸들러
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // 전체 동의하기 버튼 핸들러
  const handleAgreeAll = () => {
    if (isAllItemsAgreed) {
      navigate("/indemnity");
    }
  };

  // 모달이 닫혀있으면 아무것도 렌더링하지 않음
  if (!isOpen) return null;

  return (
    <div className={modalLayOut.modalOverlay}>
      <div className={modalLayOut.modal_bottom}>
        <div className={styles.title}>
          <h1>
            <span>아래 내용</span>을 확인해주세요
          </h1>
          <img
            src={cancel}
            alt="닫기"
            onClick={handleClose}
            style={{ cursor: "pointer" }}
          />
        </div>
        <div className={styles.checkContents}>
          <div className={styles.allAgree}>
            <div className={styles.checkboxWrapper}>
              <FontAwesomeIcon
                icon={faCheck}
                className={styles.checkIcon}
                onClick={toggleAllCheck}
                style={getCheckIconStyle(isAllAgreed)}
              />
              <p className={styles.allAgreeText}>전체동의</p>
            </div>
          </div>

          <div className={styles.checkListContainer}>
            {agreeItems.map((item, index) => (
              <div
                key={index}
                className={index === 0 ? styles.firstAgree : styles.secondAgree}
              >
                <div>
                  <div className={styles.checkboxWrapper}>
                    <FontAwesomeIcon
                      icon={faCheck}
                      className={styles.checkIcon}
                      onClick={() => toggleAgreement(index)}
                      style={getCheckIconStyle(agrees[index])}
                    />
                    <p className={styles.itemTitle}>{item.title}</p>
                  </div>
                </div>
                <ul>
                  {item.contents.map((content, contentIndex) => (
                    <li key={contentIndex}>
                      <span>{content}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <button
          className={`${styles.agreeButton} ${
            isAllItemsAgreed ? "" : styles.disabledButton
          }`}z
          disabled={!isAllItemsAgreed}
          onClick={handleAgreeAll}
        >
          전체동의 하기
        </button>
      </div>
    </div>
  );
}

export default CheckList;
