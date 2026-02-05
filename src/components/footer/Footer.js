import React, { useState } from "react";
import styles from "../../css/common/Footer.module.css";
import DownChk from "../../assets/DownChk.svg";

function Footer() {
  const [isOpen, setIsOpen] = useState(false);
  const hostname = window.location.hostname;

  const emergencyNavigate = () => {
    // 부드러운 전환을 위한 약간의 지연
    setTimeout(() => {
      if (hostname === "b2b.retrust.world" || hostname === "b2b-dev.retrust.world") {  // 다른 도메인에서는 현재 경로 유지
        const pathSegments = window.basename.split('/');
        const partnerCd = pathSegments[0];
        window.location.href = `${window.location.origin}/${partnerCd}/claim/emergencySupport`;

      } else {
        window.location.href = `${window.location.origin}/claim/emergencySupport`;
      }
    }, 100);
  };

  const navigateToPage = (path) => {
    setTimeout(() => {
      if (hostname === "b2b.retrust.world" || hostname === "b2b-dev.retrust.world") {
        window.location.href = `${window.location.origin}${window.basename}/claim${path}`;
      } else {
        //        // b2b 도메인에서는 basename을 그대로 사용 (이미 /claim이 포함됨)
        window.location.href = `${window.location.origin}${path}`;
      }
    }, 100);
  };

  return (
    <div className={styles.footers}>
      <div className={styles.footersWrap}>
        <div className={styles.footerHeader}>
          <div className={styles.companyInfo}>
            <p>{process.env.REACT_APP_COMPANY_NAME}</p>
            <p>{process.env.REACT_APP_TEL_NO}</p>
          </div>
          <div className={styles.companyInfo2}>
            <span>9:00~18:00 (점심시간 12:00-13:00)</span>
            <span>DAY OFF (토/일/공휴일)</span>
          </div>
        </div>
        <div className={styles.boundaryWrap}>
          <div className={styles.boundary}></div>
        </div>
        <div className={styles.footerListwrap}>
          <div className={styles.footerList}>
            <ul>
              <li className="cursor-pointer" onClick={emergencyNavigate}>
                24시간 우리말의료상담
              </li>
              <li
                onClick={() => navigateToPage("/individualInfo")}
                className="cursor-pointer"
              >
                개인정보처리방침
              </li>
              <li
                onClick={() => navigateToPage("/serviceInfo")}
                className="cursor-pointer"
              >
                서비스 이용약관
              </li>
            </ul>

            <img
              src={DownChk}
              alt="DownChk"
              className={`${styles.toggleIcon} ${isOpen ? styles.rotated : ""}`}
              onClick={() => setIsOpen(!isOpen)}
            />
          </div>
          <div
            className={`${styles.footerBody} ${isOpen ? styles.expanded : ""}`}
          >
            <div className={styles.hiddenContent}>
              <p>(주)리트러스트 | 대표 장우석</p>
              <p>사업자 등록번호 370-88-02749</p>
              <p>통신판매업신고번호 제 2024-부산남구-0464호</p>
              <p>대리점등록번호 2024040026호</p>
              <p>주소 부산시 남구 문현 금융로 40 BIFC 8층 2호</p>
            </div>
          </div>
          <div className={styles.copyright}>
            <p>Copyright© Retrust. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;