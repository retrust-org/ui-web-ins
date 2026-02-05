import React from "react";
import commonLeftArrow from "../../../assets/commonLeftArrow.svg";
import styles from "../../../css/claim/claimHeader.module.css";
import { useNavigate } from "react-router-dom";

function ClaimHeader({ titleText }) {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1); // 이전 페이지로 이동합니다.
  };

  return (
    <>
      <div className={styles.HeaderWrap}>
        <div className={styles.HeaderContents}>
          <div className={styles.ContentsWrap}>
            <img src={commonLeftArrow} alt="LeftArrow" onClick={goBack} />
            <p>{titleText}</p>
            <div className="w-[24px]"></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ClaimHeader;
