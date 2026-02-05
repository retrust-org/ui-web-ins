import React, { useState } from "react";
import commonX from "../../../assets/commonX.svg";
import styles from "../../../css/claim/claimSelectBankModal.module.css";
import bankData from "../../../data/SelectedBankDaata.json";

function SelectBankModal({ isOpen, onClose, onSelectBank }) {
  const filters = ["은행", "증권"];
  const [activeFilterIndex, setActiveFilterIndex] = useState(0); // 초기값은 "은행"

  const handleClickFilter = (index) => {
    setActiveFilterIndex(index);
  };

  const handleBankSelect = (bankName) => {
    const selectedBank = bankData[activeFilterIndex].find(
      (bank) => bank.bank_name === bankName
    );
    // 은행명과 은행 코드를 함께 전달
    onSelectBank(selectedBank.bank_name, selectedBank.bank_cd);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div className={styles.ModalBackdrop}>
          <div className={styles.ModalContents}>
            <div className={styles.ModalContentsWrap}>
              <div className={styles.ModalContents_Title}>
                <img
                  src={commonX}
                  alt="닫기"
                  className={styles.CloseButton}
                  onClick={onClose}
                />
              </div>
              <h3>금융기관을 선택해주세요.</h3>
              <div className={styles.ButtonContents}>
                {filters.map((filter, index) => (
                  <button
                    key={index}
                    className={activeFilterIndex === index ? styles.active : ""}
                    onClick={() => handleClickFilter(index)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
            {/* 은행 또는 증권 데이터 출력 */}
            <div className={styles.BankMenuContents}>
              <div className={styles.BankMenu}>
                {bankData[activeFilterIndex].map((bank, index) => (
                  <div
                    className={styles.BankItemWrap}
                    key={index}
                    onClick={() => handleBankSelect(bank.bank_name)}
                  >
                    <div className={styles.BankItem}>
                      <div className={styles.ImagesWrap}>
                        <img src={bank.image_url} alt={bank.bank_name} />
                      </div>
                      <span>{bank.bank_name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SelectBankModal;
