import React from 'react';
import BaseModalBottom from '../../../../components/layout/BaseModalBottom';
import styles from '../../../../css/disasterHouse/workSpaceModal.module.css';
import cancel from '../../../../assets/commonX.svg';

function HanokModal({ isOpen, onClose, onSelect }) {
    if (!isOpen) return null;

    const handleSelectYes = () => {
        onSelect(true); // 한옥
    };

    const handleSelectNo = () => {
        onSelect(false); // 한옥 아님
    };

    return (
        <BaseModalBottom onClose={onClose}>
            <button className={styles.closeButton} onClick={onClose}>
                <img src={cancel} alt="cancel" />
            </button>

            <div className={styles.modalHeader}>
                <h2 className={styles.title}>이 건물이 한옥인가요?</h2>
                <span className={styles.subTitle}></span>
            </div>

            <div className={styles.buttonContainer}>
                <button
                    className={`${styles.button} ${styles.primaryBtn}`}
                    onClick={handleSelectYes}
                >
                    예
                </button>
                <button
                    className={`${styles.button} ${styles.secondaryBtn}`}
                    onClick={handleSelectNo}
                >
                    아니오
                </button>
            </div>
        </BaseModalBottom>
    );
}

export default HanokModal;
