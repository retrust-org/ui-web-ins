import React from "react";
import commonX from "../../assets/commonX.svg";
import styles from "../../css/claim/claimSelectBankModal.module.css";
import bankData from "../../data/SelectedBankDaata.json";

function BankSelectModal({ isOpen, onClose, onSelectBank }) {
  const banks = bankData[0]; // Only use banks (first array), not securities

  const handleBankSelect = (bankName) => {
    const selectedBank = banks.find(
      (bank) => bank.bank_name === bankName
    );
    // Pass bank name and bank code to parent
    onSelectBank(selectedBank.bank_name, selectedBank.bank_cd);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div className={styles.ModalBackdrop}>
          <div className={styles.ModalContents}>
            {/* 헤더 영역 - 고정 */}
            <div className={styles.ModalContentsWrap}>
              <div className={styles.ModalContents_Title}>
                <img
                  src={commonX}
                  alt="닫기"
                  className={styles.CloseButton}
                  onClick={onClose}
                />
              </div>
              <h3>은행을 선택해주세요.</h3>
            </div>
            {/* 은행 목록 영역 - 스크롤 */}
            <div className={styles.BankMenuContents}>
              <div className={styles.BankMenu}>
                {banks.map((bank, index) => (
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

export default BankSelectModal;
