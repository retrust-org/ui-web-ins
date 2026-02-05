import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../../../css/disasterSafeguard/collectAgree.module.css";
import DisasterHeader from "../../../../components/headers/DisasterHeader";

function ProvideAgree() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <DisasterHeader
        title="실손보상 소상공인 풍수해·지진재해보험"
        onBack={() => navigate(-1)}
      />

      <div className={styles.content}>
        <h1 className={styles.mainTitle}>개인정보 제3자 제공 동의서</h1>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>필수 개인정보 제 3자 제공 동의</h2>
          <p className={styles.sectionText}>
            주식회사 리트러스트(이하 '회사'라함)는 "신용정보의 이용 및 보호에 관한
            법률", "전자금융거래법", "전자상거래 등에서의 소비자보호에 관한 법률",
            "정보통신망 이용촉진 및 정보보호 등에 관한 법률" 및 "개인정보 보호법"
            등 관련 법령을 준수하여, 이용자 권익 보호에 최선을 다하고 있습니다.
          </p>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.section}>
          <h3 className={styles.subTitle}>보험 계약 체결전 사전조회</h3>

          <p className={styles.itemLabel}>개인정보를 제공받는 자:</p>
          <p className={styles.itemText}>보험사</p>

          <p className={styles.itemLabel}>제공받는 자의 이용 목적:</p>
          <p className={styles.itemText}>보험 계약 체결전 사전조회</p>

          <p className={styles.itemLabel}>제공하는 개인정보의 항목:</p>
          <p className={styles.itemSubLabel}>주소 및 건물 관련 정보:</p>
          <p className={styles.itemText}>
            소재지주소 관련 정보, 내진설계 여부, 건물 세부 코드, 건물 구조, 주택
            종류, 건물지상총층수, 건물지하총층수, 보험가입지상층수, 총 가입세대수,
            보험가입면적, 주택 소유자
          </p>
          <p className={styles.itemSubLabel}>보험 가입 정보:</p>
          <p className={styles.itemText}>
            보험개시일시, 보험종료일시, 건물 가입금액, 자기부담금, 총보험료,
            개인부담보험료, 지방자치단체부담보험료, 정부부담보험료
          </p>

          <p className={styles.itemLabel}>제공받는 자의 보유 및 이용기간:</p>
          <p className={styles.itemText}>
            보험계약 미체결시 동의일로부터 1년, 보험계약 체결시 거래종료 후 5년까지 보관
          </p>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.section}>
          <p className={styles.notice}>
            동의 거부권 및 불이익: 정보주체는 개인정보 제3자 제공에 동의하지 않을
            권리가 있으며, 동의를 거부할 경우 보험 계약 체결전 사전조회를 할 수
            없습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProvideAgree;
