import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../../../css/disasterSafeguard/collectAgree.module.css";
import DisasterHeader from "../../../../components/headers/DisasterHeader";

function CollectAgree() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <DisasterHeader
        title="실손보상 소상공인 풍수해·지진재해보험"
        onBack={() => navigate(-1)}
      />

      <div className={styles.content}>
        <h1 className={styles.mainTitle}>개인정보 수집이용 동의서</h1>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>필수 개인정보 수집·이용동의</h2>
          <p className={styles.sectionText}>
            주식회사 리트러스트(이하 '회사'라함)는 "신용정보의 이용 및 보호에 관한
            법률", "전자금융거래법", "전자상거래 등에서의 소비자보호에 관한 법률",
            "정보통신망 이용촉진 및 정보보호 등에 관한 법률" 및 "개인정보 보호법"
            등 관련 법령을 준수하여, 이용자 권익 보호에 최선을 다하고 있습니다.
          </p>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.section}>
          <h3 className={styles.subTitle}>개인정보의 수집∙이용 목적</h3>
          <ul className={styles.list}>
            <li>보험료 조회내역 확인</li>
            <li>보험계약 체결 전 사전조회</li>
            <li>보험계약 인수가능 여부 판단</li>
          </ul>
        </div>

        <div className={styles.section}>
          <h3 className={styles.subTitle}>수집∙이용하는 개인정보 항목</h3>
          <p className={styles.itemLabel}>주소 및 건물 관련 정보:</p>
          <p className={styles.itemText}>
            소재지주소 관련 정보, 내진설계 여부, 건물 세부 코드, 건물 구조, 주택
            종류, 건물지상총층수, 건물지하총층수, 보험가입지상층수, 총 가입세대수,
            보험가입면적, 주택 소유자
          </p>
          <p className={styles.itemLabel}>보험 가입 정보:</p>
          <p className={styles.itemText}>
            보험개시일시, 보험종료일시, 건물 가입금액, 자기부담금, 총보험료,
            개인부담보험료, 지방자치단체부담보험료, 정부부담보험료
          </p>
        </div>

        <div className={styles.section}>
          <h3 className={styles.subTitle}>개인정보의 보유 및 이용기간</h3>
          <p className={styles.periodText}>
            개인정보 수집·이용 동의일로부터 1개월
          </p>
          <p className={styles.periodNote}>
            -보험가입 성사 여부와 관계없이 동의일로부터 1개월 경과 시 수집된 모든
            개인정보를 완전히 파기합니다.
          </p>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.section}>
          <p className={styles.notice}>
            이용자는 회사의 개인정보 수집∙이용 동의를 거부할 권리가 있습니다.
            다만, 개인정보의 수집∙이용 동의를 거부할 경우 보험료 상담 및 체결
            서비스 이용이 제한될 수 있음을 알려드립니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CollectAgree;
