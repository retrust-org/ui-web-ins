import React from "react";
import IndividualInfos from "../../data/IndividualInfo";
import styles from "../../css/common/serviceAnnonuce.module.css";
import Button from "../buttons/Button";
import { useNavigate } from "react-router-dom";

function IndividualInfo() {
  const navigate = useNavigate("");

  return (
    <div className={styles.TextContainer}>
      <div className={styles.TextContainerWrap}>
        {IndividualInfos.map((info, index) => (
          <div key={index}>
            <div className={styles.contentTitle}>{info.content}</div>
            {info.dates && (
              <div>
                {info.dates.map((date, idx) => (
                  <p key={idx}>{date}</p>
                ))}
              </div>
            )}
            <p>{info.describe}</p>
            {/* 예외 처리: title이 존재할 경우에만 출력 */}
            {info.title && <h3 className={styles.infotitle}>{info.title}</h3>}
            {info.sections.map((section, sIndex) => (
              <div key={sIndex}>
                <p className={styles.sectionText}>{section.section}</p>
                {/* 예외 처리: subSections가 배열이고 길이가 0보다 클 경우에만 출력 */}
                {Array.isArray(section.subSections) &&
                  section.subSections.length > 0 && (
                    <ul>
                      {section.subSections.map((subSection, ssIndex) => (
                        <li key={ssIndex}>{subSection}</li>
                      ))}
                    </ul>
                  )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <Button 
        buttonText="확인"
        onClick={() => {
          navigate(-1);
        }}
      />
    </div>
  );
}

export default IndividualInfo;
