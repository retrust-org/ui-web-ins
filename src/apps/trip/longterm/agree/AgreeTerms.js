import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import styles from "../../../../css/trip/announce.module.css";
import modalLayOut from "../../../../css/common/modalLayOut.module.css";
import { FaGreaterThanSvg } from "../../../../components/svgIcons/RestFinishSVG";
import commonX from "../../../../assets/commonX.svg";
import Button from "../../../../components/buttons/Button";
import checkboxStyles from "./CustomChk";

function AgreeTerms({ isOpen, onClose }) {
  const navigate = useNavigate();

  const [modalState, setModalState] = useState(() => {
    const storedState = sessionStorage.getItem("agreeTermsModalState");
    if (storedState) {
      const parsedState = JSON.parse(storedState);
      return {
        agrees: parsedState.agrees || [false, false, false, false, false],
        isAllAgreed: parsedState.isAllAgreed || false,
        isModalOpen: isOpen,
      };
    }
    return {
      agrees: [false, false, false, false, false],
      isAllAgreed: false,
      isModalOpen: isOpen,
    };
  });

  const { agrees, isAllAgreed } = modalState;

  useEffect(() => {
    if (modalState.isModalOpen) {
      sessionStorage.setItem(
        "agreeTermsModalState",
        JSON.stringify(modalState)
      );
    }
  }, [modalState]);

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

  const agreementTexts = [
    "단체보험서비스 이용약관",
    "단체보험 규약",
    "개인(신용)정보 조회에 관한 사항",
    "개인(신용)정보 제3자 제공에 관한 사항",
    "개인(신용)정보 수집·이용에 관한 사항",
  ];

  const toggleAllCheck = () => {
    setModalState((prev) => ({
      ...prev,
      isAllAgreed: !prev.isAllAgreed,
      agrees: new Array(5).fill(!prev.isAllAgreed),
    }));
  };

  const CheckAgreement = (index) => {
    const updatedAgrees = [...agrees];
    updatedAgrees[index] = !updatedAgrees[index];
    setModalState((prev) => ({
      ...prev,
      agrees: updatedAgrees,
      isAllAgreed: updatedAgrees.every((agreement) => agreement),
    }));
  };

  const handleTermClick = (text) => {
    navigate(`/signup/agreeitem/${text}`);
  };

  const handleClose = () => {
    sessionStorage.removeItem("agreeTermsModalState");
    onClose();
  };

  const isRequiredAgreed =
    agrees[0] && agrees[1] && agrees.slice(2).every((agreement) => agreement);

  const handleConfirm = () => {
    if (isRequiredAgreed) {
      sessionStorage.removeItem("agreeTermsModalState");
      onClose();
      navigate("/signup/guarantee");
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`${modalLayOut.modalOverlay} ${
        isOpen
          ? modalLayOut.modalOverlay_enter_active
          : modalLayOut.modalOverlay_exit_active
      }`}
      onClick={handleOverlayClick}
    >
      <div
        className={`${modalLayOut.modal_bottom} ${
          isOpen
            ? modalLayOut.modal_bottom_enter_active
            : modalLayOut.modal_bottom_exit_active
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.Wrap}>
          <div className={styles.TitleLogoFlex}>
            <h3 className={styles.h3_agreeTitle}>
              보험가입을 위한 다음 약관들에
              <br /> 동의해주세요
            </h3>
            <div>
              <div onClick={handleClose}>
                <img src={commonX} alt="close" />
              </div>
            </div>
          </div>

          <form className="w-full flex flex-col justify-center">
            <div className={styles.first_agreeTextBox}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <FontAwesomeIcon
                  icon={faCheck}
                  className={styles.checkIcon}
                  onClick={toggleAllCheck}
                  style={getCheckIconStyle(isAllAgreed)}
                />
              </div>
              <label htmlFor="chkAll" className={styles.frist_agreeTitle}>
                전체동의 (대표자 동의)
              </label>
              <input
                type="checkbox"
                id="chkAll"
                hidden
                style={
                  isAllAgreed
                    ? {
                        ...checkboxStyles.inputCheckbox,
                        ...checkboxStyles.CheckboxChecked,
                      }
                    : checkboxStyles.inputCheckbox
                }
                checked={isAllAgreed}
                onChange={toggleAllCheck}
              />
            </div>

            {agreementTexts.map((text, index) => (
              <div className={styles.agreeTerms_select} key={index}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <FontAwesomeIcon
                    icon={faCheck}
                    className={styles.checkIcon}
                    style={getCheckIconStyle(agrees[index])}
                    onClick={() => CheckAgreement(index)}
                  />
                </div>
                <div style={{ width: "100%", marginBottom: "4px" }}>
                  <label
                    htmlFor={`chk${index + 1}`}
                    className={styles.agreeText}
                  >
                    {text}
                  </label>
                  <input
                    type="checkbox"
                    id={`chk${index + 1}`}
                    hidden
                    style={
                      agrees[index]
                        ? {
                            ...checkboxStyles.inputCheckbox,
                            ...checkboxStyles.CheckboxChecked,
                          }
                        : checkboxStyles.inputCheckbox
                    }
                    checked={agrees[index]}
                    onChange={() => CheckAgreement(index)}
                  />
                </div>
                <div
                  className="cursor-pointer"
                  onClick={() => handleTermClick(text)}
                >
                  <FaGreaterThanSvg />
                </div>
              </div>
            ))}
          </form>

          <div className={styles.btnWrap}>
            <Button
              buttonText="확인하기"
              onClick={handleConfirm}
              disabled={!isRequiredAgreed}
              showFloatingLogo={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgreeTerms;
