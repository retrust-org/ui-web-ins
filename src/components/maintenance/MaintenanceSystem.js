import React, { useState, useEffect, useRef } from "react";
import SystemMaintenanceModal from "../modals/SystemMaintenanceModal";
import styles from "../../css/maintenance/maintenanceSystem.module.css";

// 한국시간(UTC+9) 가져오기 함수
const getKoreanTime = () => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const koreanTime = new Date(utc + (9 * 3600000)); // UTC+9
  return koreanTime;
};

// 정확한 테스트 시간 설정 (한국시간 기준)
const getMaintenanceTimes = () => {
  const startTime = new Date('2025-09-19 16:45:00'); // 2025년 9월 19일 오후 3시 54분
  const endTime = new Date('2025-09-19 17:20:00');   // 2025년 9월 19일 오후 4시 0분 (6분 후)
  return { startTime, endTime };
};

// 점검 시간 여부 확인 함수
const isMaintenanceTime = () => {
  const now = getKoreanTime();
  const { startTime, endTime } = getMaintenanceTimes();



  return now >= startTime && now < endTime;
};

// 점검 5분 전인지 확인 함수
const isFiveMinutesBefore = () => {
  const now = getKoreanTime();
  const { startTime } = getMaintenanceTimes();
  const fiveMinutesBefore = new Date(startTime.getTime() - 5 * 60000);

  const shouldStartTimer = now >= fiveMinutesBefore;


  return shouldStartTimer;
};

function MaintenanceSystem() {
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerRef = useRef(null);
  const initialTimeoutRef = useRef(null);

  useEffect(() => {
    // 즉시 점검 시간 체크
    const checkMaintenanceTime = () => {
      const shouldShow = isMaintenanceTime();
      setShowMaintenanceModal(shouldShow);
    };

    // 타이머 시작 함수
    const startTimer = () => {

      setIsTimerActive(true);
      checkMaintenanceTime(); // 즉시 체크
      timerRef.current = setInterval(checkMaintenanceTime, 30000); // 1분마다
    };

    // 초기 설정
    const initialize = () => {

      if (isFiveMinutesBefore()) {
        // 이미 5분 전이면 즉시 타이머 시작
        startTimer();
      } else {
        // 5분 전까지 대기
        const { startTime } = getMaintenanceTimes();
        const fiveMinutesBefore = new Date(startTime.getTime() - 5 * 60000);
        const now = getKoreanTime();
        const waitTime = fiveMinutesBefore.getTime() - now.getTime();

        initialTimeoutRef.current = setTimeout(() => {
          startTimer();
        }, waitTime);
      }
    };

    // Page Visibility API - 탭 포커스 시 즉시 체크
    const handleVisibilityChange = () => {
      if (!document.hidden) {

        if (isFiveMinutesBefore() && !isTimerActive) {
          startTimer();
        } else if (isTimerActive) {
          checkMaintenanceTime();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 초기화 실행
    initialize();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (initialTimeoutRef.current) {
        clearTimeout(initialTimeoutRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isTimerActive]);

  if (!showMaintenanceModal) return null;

  return (
    <div className={styles.maintenanceOverlay}>
      <div className={styles.maintenanceModal}>
        <SystemMaintenanceModal
          isOpen={showMaintenanceModal}
          onClose={() => {
            // 점검 중에는 닫기 불가능하도록 처리
            if (!isMaintenanceTime()) {
              setShowMaintenanceModal(false);
            }
          }}
        />
      </div>
    </div>
  );
}

export default MaintenanceSystem;