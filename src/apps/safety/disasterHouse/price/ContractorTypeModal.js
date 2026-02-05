import React from 'react';
import BaseModalBottom from '../../../../components/layout/BaseModalBottom';
import styles from '../../../../css/disasterHouse/workSpaceModal.module.css';
import cancel from '../../../../assets/commonX.svg';

function ContractorTypeModal({ isOpen, onClose, onSelect }) {
    if (!isOpen) return null;

    const handleSelectPersonal = () => {
        onSelect('01'); // 개인
    };

    const handleSelectBusiness = () => {
        onSelect('02'); // 사업자
    };

    return (
        <BaseModalBottom onClose={onClose}>
            <button className={styles.closeButton} onClick={onClose}>
                <img src={cancel} alt="cancel" />
            </button>

            <div className={styles.modalHeader}>
                <h2 className={styles.title}>계약자 정보를 알려주세요</h2>
                <span className={styles.subTitle}></span>
            </div>

            <div className={styles.buttonContainer}>
                <button
                    className={`${styles.button} ${styles.primaryBtn}`}
                    onClick={handleSelectBusiness}
                >
                    사업자예요
                </button>
                <button
                    className={`${styles.button} ${styles.secondaryBtn}`}
                    onClick={handleSelectPersonal}
                >
                    개인이예요
                </button>
            </div>
        </BaseModalBottom>
    );
}

export default ContractorTypeModal;
