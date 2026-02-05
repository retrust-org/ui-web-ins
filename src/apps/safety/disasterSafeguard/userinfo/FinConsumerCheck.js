import React, { useState } from 'react';
import BaseModalBottom from '../../../../components/layout/BaseModalBottom';
import styles from '../../../../css/disasterSafeguard/userinfo.module.css';
import cancel from '../../../../assets/commonX.svg';
import ErrorModal from '../../../../components/modals/ErrorModal';

function FinConsumerCheck({ isOpen, onConsumerTypeSelect, onClose }) {
    const [showErrorModal, setShowErrorModal] = useState(false);

    if (!isOpen && !showErrorModal) return null;

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            // onClose가 없으면 기본값으로 '일반' 선택
            onConsumerTypeSelect('일반');
        }
    };

    const handleProfessionalSelect = () => {
        setShowErrorModal(true);
    };

    const handleErrorModalClose = () => {
        setShowErrorModal(false);
    };

    // 에러 모달이 표시 중이면 금융소비자 모달은 숨김
    if (showErrorModal) {
        return (
            <ErrorModal
                message="전문금융소비자는 가입할 수 없어요."
                onClose={handleErrorModalClose}
            />
        );
    }

    return (
        <BaseModalBottom onClose={handleClose}>
            <button className={styles.closeButton} onClick={handleClose}>
                <img src={cancel} alt="cancel" />
            </button>

            <div className={styles.modalContent}>
                <h2>금융소비자 확인</h2>
                <p className={styles.subTitle}>전문 금융소비자가 아닐 경우 일반을 선택해주세요</p>
                <div className={styles.modalButtons}>
                    <button onClick={handleProfessionalSelect}>전문</button>
                    <button onClick={() => onConsumerTypeSelect('일반')}>일반</button>
                </div>
            </div>
        </BaseModalBottom>
    );
}

export default FinConsumerCheck;