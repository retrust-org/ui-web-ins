import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styles from "../../../../css/trip/progressbar.module.css";

function Progressbar() {
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    switch (location.pathname) {
      case "/trip":
        setActiveStep(2);
        break;
      case "/indemnity":
        setActiveStep(3);
        break;
      case "/purpose":
        setActiveStep(3);
        break;
      case "/confirm":
        setActiveStep(4);
        break;
      default:
        setActiveStep(1);
        break;
    }
  }, [location.pathname]);

  const stepTitles = [
    "가입 정보 입력",
    "여행지 입력",
    "보장 선택",
    "보장 확인",
  ];

  const ActiveSvg = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <circle cx="10" cy="10" r="10" fill="#C1D1C1" />
      <circle cx="10" cy="10" r="5" fill="#386937" />
    </svg>
  );

  return (
    <div className={styles.ProgressbarHeader}>
      <div className={styles.ProgressbarWrap}>
        <div className={styles.Progressbarline}></div>
        <div className={styles.flexCenter}>
          {stepTitles.map((title, index) => (
            <div key={index} className={styles.stepItem}>
              <div className={styles.stepCircle}>
                {activeStep >= index + 1 ? (
                  <ActiveSvg />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <circle
                      cx="10"
                      cy="10"
                      r="9.5"
                      fill="white"
                      stroke="#B8B9BC"
                    />
                  </svg>
                )}
              </div>
              <p
                className={`${styles.stepText} ${
                  activeStep >= index + 1
                    ? styles.stepText_active
                    : styles.stepText_inactive
                }`}
              >
                {title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Progressbar;