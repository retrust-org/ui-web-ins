import React, { useState, useEffect, useRef } from "react";
import Button from "../../components/buttons/Button";
import { useSelector } from "react-redux";
import commonX from "../../assets/commonX.svg";
import styles from "../../css/common/confirmModal.module.css";
import modalLayOut from "../../css/common/modalLayOut.module.css";

const ConfirmModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);
  const selectedData = useSelector(
    (state) =>
      state.country.selectedCountryData || state.country.recommendedCountryData
  );
  const korNatlNm = selectedData ? selectedData.korNatlNm : "";
  const priceData = useSelector((state) => state.priceData.priceData);
  const recommendTexts = priceData ? priceData.recommendText : null;
  const [displayText, setDisplayText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  const processText = (text) => {
    let processedText = text;
    processedText = processedText.replace(/\^/g, "");
    if (processedText.includes("[지역]")) {
      processedText = processedText.replace("[지역]", korNatlNm);
    } else if (processedText.trim().startsWith("여행을 가시는군요")) {
      processedText = `${korNatlNm} ${processedText}`;
    }
    return processedText;
  };

  useEffect(() => {
    let timer;
    if (isOpen && recommendTexts) {
      timer = setInterval(() => {
        if (textIndex < recommendTexts.length) {
          const currentText = processText(recommendTexts[textIndex]);
          if (charIndex < currentText.length) {
            setDisplayText((prevText) => prevText + currentText[charIndex]);
            setCharIndex((prevIndex) => prevIndex + 1);
          } else {
            setTextIndex((prevIndex) => prevIndex + 1);
            setCharIndex(0);
            setDisplayText((prevText) => prevText + " ");
          }
        } else {
          clearInterval(timer);
        }
      }, 20);
    } else {
      setDisplayText("");
      setTextIndex(0);
      setCharIndex(0);
    }
    return () => clearInterval(timer);
  }, [isOpen, recommendTexts, charIndex, textIndex, korNatlNm]);

  const highlightText = (text) => {
    const regex = new RegExp(korNatlNm, "g");
    return text.split(regex).map((part, index, arr) => (
      <React.Fragment key={index}>
        {part}
        {index < arr.length - 1 && (
          <span style={{ color: "red" }}>{korNatlNm}</span>
        )}
      </React.Fragment>
    ));
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const handleClose = (e) => {
    e?.stopPropagation();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`${modalLayOut.modalOverlay} ${
        isOpen ? modalLayOut.modalOverlay_enter_active : ""
      }`}
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className={`${modalLayOut.modal_bottom} ${
          isOpen ? modalLayOut.modal_bottom_enter_active : ""
        }`}
        onClick={handleModalClick}
      >
        <div className={styles.animationContent}>
          <h2>리트러스트가 추천하는 맞춤 플랜!</h2>
          <div className={styles.cursor} onClick={handleClose}>
            <img src={commonX} alt="Close" />
          </div>
        </div>
        <div className={styles.highlightTextContents}>
          <span>{highlightText(displayText)}</span>
        </div>
        <Button
          buttonText="확인하기"
          onClick={handleClose}
          showFloatingLogo={false}
        />
      </div>
    </div>
  );
};

export default ConfirmModal;
