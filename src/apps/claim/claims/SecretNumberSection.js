import React from "react";
import styles from "../../../css/claim/claimMembersInfo.module.css";

function SecretNumberSection() {
  return (
    <div className={styles.secretNumberWrap}>
      <span>·</span>
      <p className={styles.secretNumberContents_Text}>
        당사는 피보험자가 의료급여법상 의료급여 수급권자인 경우 실손 의료보험
        상품에 한하여 보험료 할인제도를 운영하고 있습니다. (2009년 10월 이후
        청약상품 및 2014년 4월 이후 갱신계약에 한함)
      </p>
    </div>
  );
}

export default SecretNumberSection;
