import React from 'react';
import BaseModalBottom from '../../../../components/layout/BaseModalBottom';
import styles from '../../../../css/disasterHouse/resultModal.module.css';
import cancel from '../../../../assets/commonX.svg';

function Result({ isOpen, onClose, onConfirm, premiumData }) {
    if (!isOpen) return null;

    // premiumData에서 값 추출 및 포맷팅
    const indvBrdPrem = premiumData?.indvBrdPrem ? Number(premiumData.indvBrdPrem).toLocaleString('ko-KR') : '0';
    const aplPrem = premiumData?.aplPrem ? Number(premiumData.aplPrem).toLocaleString('ko-KR') : '0';
    const locgovBrdPrem = premiumData?.locgovBrdPrem ? Number(premiumData.locgovBrdPrem).toLocaleString('ko-KR') : '0';
    const govBrdPrem = premiumData?.govBrdPrem ? Number(premiumData.govBrdPrem).toLocaleString('ko-KR') : '0';

    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <BaseModalBottom onClose={onClose}>
            <button className={styles.closeButton} onClick={onClose}>
                <img src={cancel} alt="cancel" />
            </button>

            <div className={styles.modalHeader}>
                <h2 className={styles.title}>예상 보험료</h2>
                <span className={styles.subTitle}>{indvBrdPrem}원</span>
            </div>
            <div className={styles.totalInsuPrice}>
                <p>총보험료</p>
                <span>{aplPrem}원</span>
            </div>

            <div className={styles.supportGov}>
                <span>정부지원금</span>
                <ul>
                    <li>
                        <p>지방자치단체부담보험료</p>
                        <span>-{locgovBrdPrem}원</span>
                    </li>
                    <li>
                        <p>정부부담보험료</p>
                        <span>-{govBrdPrem}원</span>
                    </li>
                </ul>
            </div>
            <div className={styles.buttonContainer}>
                <button
                    className={`${styles.button} ${styles.primaryBtn}`}
                    onClick={handleConfirm}
                >
                    확인
                </button>
            </div>
        </BaseModalBottom>
    );
}

export default Result;
