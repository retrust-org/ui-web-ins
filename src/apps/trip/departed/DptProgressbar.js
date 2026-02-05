import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styles from "../../../css/trip/progressbar.module.css";

function DptProgressbar() {
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    switch (location.pathname) {
      case "/insert":
        setActiveStep(1);
        break;
      case "/trip":
        setActiveStep(2);
        break;
      case "/indemnity":
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
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="none"
    >
      <g clipPath="url(#clip0_2104_1756)">
        <circle cx="10.5" cy="10" r="10" fill="#2E66F6" fillOpacity="0.15" />
        <circle cx="10.5" cy="10" r="5" fill="#0E98F6" />
      </g>
      <defs>
        <clipPath id="clip0_2104_1756">
          <rect
            width="20"
            height="20"
            fill="white"
            transform="translate(0.5)"
          />
        </clipPath>
      </defs>
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
                style={{
                  color: activeStep >= index + 1 ? "#065286" : undefined,
                }}
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

export default DptProgressbar;