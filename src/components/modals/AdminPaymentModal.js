import React, { useState } from "react";
import styles from "../../css/common/adminPaymentModal.module.css";
import layoutStyles from "../../css/common/modalLayOut.module.css";
import commonX from "../../assets/commonX.svg";

function AdminPaymentModal({ onConfirm, onCancel, isLoading = false }) {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });

    const [errors, setErrors] = useState({
        username: '',
        password: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));

        // 입력 시 에러 메시지 제거
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleConfirm = () => {
        // 유효성 검사
        const newErrors = {};

        if (!credentials.username.trim()) {
            newErrors.username = '사용자명을 입력해주세요.';
        }

        if (!credentials.password.trim()) {
            newErrors.password = '비밀번호를 입력해주세요.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // 검증 통과 시 부모 컴포넌트에 전달
        onConfirm(credentials);
    };

    const handleCancel = () => {
        setCredentials({ username: '', password: '' });
        setErrors({ username: '', password: '' });
        onCancel();
    };

    return (
        <div className={layoutStyles.modalOverlay}>
            <div
                className={layoutStyles.modal_center}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.modalContentWrap}>
                    <div className={styles.commonX}>
                        <img src={commonX} alt="닫기" onClick={handleCancel} />
                    </div>

                    <h3 className={styles.title}>관리자 승인 결제</h3>
                    <p className={styles.subTitle}>
                        파트너 관리자 권한으로 결제를 승인합니다.<br />
                        관리자 계정 정보를 입력해주세요.
                    </p>

                    {/* 입력 필드 영역 */}
                    <div className={styles.inputSection}>
                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>사용자명</label>
                            <input
                                type="text"
                                name="username"
                                value={credentials.username}
                                onChange={handleInputChange}
                                className={`${styles.inputField} ${errors.username ? styles.inputError : ''}`}
                                placeholder="관리자 사용자명을 입력하세요"
                                disabled={isLoading}
                            />
                            {errors.username && (
                                <span className={styles.errorText}>{errors.username}</span>
                            )}
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>비밀번호</label>
                            <input
                                type="password"
                                name="password"
                                value={credentials.password}
                                onChange={handleInputChange}
                                className={`${styles.inputField} ${errors.password ? styles.inputError : ''}`}
                                placeholder="비밀번호를 입력하세요"
                                disabled={isLoading}
                            />
                            {errors.password && (
                                <span className={styles.errorText}>{errors.password}</span>
                            )}
                        </div>
                    </div>

                    <div className={styles.buttonWrap}>
                        <button
                            type="button"
                            className={`${styles.confirmButton} ${isLoading ? styles.loading : ''}`}
                            onClick={handleConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? '처리중...' : '승인 결제'}
                        </button>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={handleCancel}
                            disabled={isLoading}
                        >
                            취소
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminPaymentModal;