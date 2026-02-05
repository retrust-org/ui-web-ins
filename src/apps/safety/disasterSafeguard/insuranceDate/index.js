import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDisasterInsurance } from '../../../../context/DisasterInsuranceContext'
import styles from '../../../../css/disasterSafeguard/insuranceDate.module.css'
import DisasterHeader from '../../../../components/headers/DisasterHeader'
import SafetyButton from '../../../../components/buttons/SafetyButton'
import BaseModalBottom from '../../../../components/layout/BaseModalBottom'
import InsuranceDatePicker from '../../components/InsuranceDatePicker'
import dayjs from 'dayjs'

function InsuranceDate() {
    const navigate = useNavigate();
    const { contractData, updateContractData } = useDisasterInsurance();

    const [showCalendarModal, setShowCalendarModal] = useState(false);

    // 날짜 포맷팅 (YYYYMMDD → YYYY-MM-DD)
    const formatDisplayDate = (dateStr) => {
        if (!dateStr || dateStr.length !== 8) return '';
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        return `${year}-${month}-${day}`;
    };

    // 기본값 설정 (오늘 + 7일)
    const getDefaultDates = () => {
        const today = dayjs();
        const startDate = today.add(7, 'day').format('YYYYMMDD');
        const endDate = today.add(7, 'day').add(1, 'year').format('YYYYMMDD');
        return { startDate, endDate };
    };

    const handleDateSelect = ({ startDate, endDate }) => {
        updateContractData({
            startDate,
            endDate
        });
        setShowCalendarModal(false);
    };

    const handleNext = () => {
        // 날짜가 선택되지 않았으면 기본값 설정
        if (!contractData.startDate || !contractData.endDate) {
            const defaultDates = getDefaultDates();
            updateContractData(defaultDates);
        }
        navigate('/price');
    };

    // 현재 선택된 날짜 또는 기본값
    const displayStartDate = contractData.startDate || getDefaultDates().startDate;
    const displayEndDate = contractData.endDate || getDefaultDates().endDate;

    return (
        <>
            <DisasterHeader title="실손보상 소상공인 풍수해·지진재해보험" />
            <div className={styles.container}>
                <section className={styles.dateSection}>
                    <h1>가입하실 날짜를<br />선택해주세요</h1>

                    <div className={styles.inputGroup}>
                        <div className={styles.inputWrapper}>
                            <label>보험 시작일</label>
                            <input
                                type="text"
                                readOnly
                                value={formatDisplayDate(displayStartDate)}
                                placeholder="날짜 선택"
                                onClick={() => setShowCalendarModal(true)}
                                className={styles.dateInput}
                            />
                        </div>
                        <div className={styles.inputWrapper}>
                            <label>보험 종료일</label>
                            <input
                                type="text"
                                readOnly
                                disabled
                                value={formatDisplayDate(displayEndDate)}
                                placeholder="자동 계산"
                                className={`${styles.dateInput} ${styles.disabled}`}
                            />
                        </div>
                    </div>
                </section>
            </div>

            {/* 캘린더 모달 (아래에서 올라오는 형태) */}
            {showCalendarModal && (
                <BaseModalBottom onClose={() => setShowCalendarModal(false)}>
                    <InsuranceDatePicker
                        onDateSelect={handleDateSelect}
                        onClose={() => setShowCalendarModal(false)}
                        initialDate={contractData.startDate}
                    />
                </BaseModalBottom>
            )}

            <SafetyButton
                buttonText='다음으로'
                onClick={handleNext}
            />
        </>
    )
}

export default InsuranceDate
