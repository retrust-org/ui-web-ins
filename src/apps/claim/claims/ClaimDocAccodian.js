import React, { useState, useRef } from "react";
import styles from "../../../css/claim/claimDocuments.module.css";
import commonDownArrow from "../../../assets/commonDownArrow.svg";
import AccordionData from "../../../data/AccordionData";
import { useNavigate } from "react-router-dom";

function ClaimDocAccordion() {
  const [isActive, setIsActive] = useState([false, false, false, false, false]);
  const contentRefs = useRef([]);
  const navigate = useNavigate();

  // 아코디언 메뉴 함수
  const toggleAccordion = (index) => {
    const newIsActive = [...isActive];
    newIsActive[index] = !newIsActive[index];
    setIsActive(newIsActive);
  };

  // 아코디언 내용 높이 계산
  const getContentHeight = (index) => {
    return contentRefs.current[index]?.scrollHeight + "px";
  }; 

  return (
    <div className={styles.sectionFlexCol}>
      {AccordionData.map((section, index) => (
        <div className={styles.section} key={index}>
          <div className={styles.sectionWrap_1}>
            <div className={styles.sectionContents}>
              <div className={styles.ListWrapFlex}>
                <div
                  className={styles.sectionContentsList}
                  onClick={() => toggleAccordion(index)}
                >
                  <div className={styles.sectionTextFlexRow}>
                    <p>{section.title}</p>
                    {index === 0 && section.subtitle && (
                      <span
                        className={styles.guideBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/required");
                        }}
                      >
                        {section.subtitle}
                      </span>
                    )}
                  </div>
                  <img
                    className={
                      isActive[index] ? styles.rotate : styles.rotateUp
                    }
                    src={commonDownArrow}
                    alt="arrow"
                  />
                </div>
                <div
                  className={`${styles.acoddianBox} ${
                    isActive[index] ? styles.active : ""
                  }`}
                  style={{
                    height: isActive[index] ? getContentHeight(index) : "0",
                  }}
                  ref={(ref) => (contentRefs.current[index] = ref)}
                >
                  <div className={styles.acoddianInner}>
                    {section.commonDocs && (
                      <div className={styles.AcoddianListWrap}>
                        <div className={styles.FirstAcoddianTextBox}>
                          {section.commonDocs.docs.map((doc, i) => (
                            <ul className="flex" key={i}>
                              <li>・</li>
                              <li>{doc}</li>
                            </ul>
                          ))}
                        </div>
                      </div>
                    )}
                    {section.docs && (
                      <div className={styles.SecondAcoddianTextBox}>
                        {section.docs.map((doc, i) => (
                          <ul key={i}>
                            <li>・</li>
                            <li className="text-[#1B1E28]">{doc}</li>
                          </ul>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ClaimDocAccordion;
