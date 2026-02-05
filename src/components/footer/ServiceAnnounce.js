import React from "react";
import serviceData from "../../data/ServiceData";
import styles from "../../css/common/serviceAnnonuce.module.css";
import Button from "../buttons/Button";
import { useNavigate } from "react-router-dom";

function ServiceAnnounce() {
  const navigate = useNavigate("");
  return (
    <div className={styles.TextContainer}>
      <div className={styles.TextContainerWrap}>
        {serviceData.map((chapter, index) => (
          <div key={index}>
            {chapter.content && ( 
              <p className={styles.textTitle}>{chapter.content}</p>
            )}
            {chapter.dates && (
              <div>
                {chapter.dates.map((date, idx) => (
                  <p key={idx}>{date}</p>
                ))}
              </div>
            )}
            <h3>{chapter.title}</h3>
            {chapter.sections && (
              <div className={styles.textFlex}>
                {chapter.sections.map((section, idx) => (
                  <div key={idx}>
                    <h3>{section.section}</h3>
                    {/* subSections 처리 */}
                    <div className={styles.subSections}>
                      {section.subSections.map((subSection, subIdx) => (
                        <p key={subIdx}>{subSection}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
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

export default ServiceAnnounce;
