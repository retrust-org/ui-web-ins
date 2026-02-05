import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styles from "../../../css/trip/progressbar.module.css";

function DptSignProgress() {
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const pathname = location.pathname;
    if (
      pathname === "/signup/member" ||
      pathname === "/signup/companionmembers"
    ) {
      setActiveStep(2);
    } else if (pathname === "/signup/guarantee") {
      setActiveStep(3);
    } else if (pathname.startsWith("/signup/finish/")) {
      setActiveStep(4);
    } else {
      setActiveStep(1);
    }
  }, [location.pathname]);

  const stepTitles = ["가입자 정보", "청약내용", "결제", "가입완료"];

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
    <div className={styles.ProgressbarWrap2}>
      <div className={styles.flexCenter}>
        {stepTitles.map((title, index) => (
          <div key={index} className={styles.flexColumnCenter}>
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
                <g clipPath="url(#clip0_20_6917)">
                  <circle
                    cx="10"
                    cy="10"
                    r="9.5"
                    fill="white"
                    stroke="#B8B9BC"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_20_6917">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            )}
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
      <div className={styles.Progressbarline}></div>
    </div>
  );
}

export default DptSignProgress;