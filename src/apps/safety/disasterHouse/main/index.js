import React from "react";
import house from "../../../../assets/safetyHouse-house.svg";
import category from "../../../../assets/safeGuard-category.svg";
import byMertiz from "../../../../assets/safeGuard-meritz.svg";
import coverageSupport from "../../../../assets/safeGuard-support.svg";
import supportDetail_1 from "../../../../assets/house-supportDetail-1.svg";
import supportDetail_2 from "../../../../assets/house-supportDetail-2.svg";
import supportDetail_3 from "../../../../assets/house-supportDetail-3.svg";
import styles from "../../../../css/disasterHouse/index.module.css";
import SafetyButton from "../../../../components/buttons/SafetyButton";
import { useNavigate } from "react-router-dom";
import DisasterMainHeader from "../../../../components/headers/DisasterMainHeader";
import Footer from "../../../../components/footer/Footer";

function DisasterMain() {
  const navigate = useNavigate();

  const nextBtn = () => {
    navigate("/address");
  };

  return (
    <>
      <div id={styles.houseContainer}>
        <div className={styles.headerWrapping}>
          <DisasterMainHeader title="주택 풍수해" />
          <div className={styles.subHeaders}>
            <ul>
              <li>정부지원금</li>
              <li>사업장</li>
              <li>주택</li>
            </ul>
          </div>
        </div>
        <div className={styles.houseContainerWrap}>
          <section className={styles.houseMainSection}>
            <div className={styles.houseTitle}>
              <img src={house} alt="house" />
              <div className={styles.houseTitleText}>
                <h1>
                  더 안전한 우리 집 <br /> <span>주택 풍수해보험</span>
                </h1>
                <img
                  src={byMertiz}
                  alt="byMertiz"
                  className={styles.houseMeritzLogo}
                />
              </div>
            </div>
          </section>
          <section className={styles.houseCoverageSection}>
            <div className={styles.houseCoverageContents}>
              <h2>국가 및 지자체 지원 보험</h2>
              <p>보험료  55%이상 지원</p>
              <img src={coverageSupport} alt="coverageSupport" />
            </div>
            <div className={styles.houseSupportDetail}>
              <div className={styles.houseSupportContents}>
                <img src={supportDetail_1} alt="" />
                <div className={styles.houseSupportDetailText}>
                  <span>번거롭게 계약서 찾지 않아도 돼요</span>
                  <h3>최소한의 정보로 간편가입</h3>
                </div>
              </div>
              <div className={styles.houseSupportContents}>
                <img src={supportDetail_2} alt="" />
                <div className={styles.houseSupportDetailText}>
                  <span>재난지원금보다 더 높은 풍수해 보험금</span>
                  <h3>복구비 기준액 대비 최고 90%까지</h3>
                </div>
              </div>
              <div className={styles.houseSupportContents}>
                <img src={supportDetail_3} alt="" />
                <div className={styles.houseSupportDetailText}>
                  <span>소상공인들을 위한 사업장 사고 방지</span>
                  <h3>정부지원금으로 가입비용 절감</h3>
                </div>
              </div>
            </div>
          </section>
          <section className={styles.houseCiteSection}>
            <cite>
              준법감시인 심의필 제2025-광고-0000호(2025.00.00~2026.00.00)
            </cite>
          </section>
          <section className={styles.houseProviderSection}>
            <h2>
              언제 일어날 지 모르는 <br />
              <span>각종 풍수해 대비해요</span>
            </h2>
            <div className={styles.houseProviderSectionImage}>
              <img src={category} alt="providerSectionImage-category" />
            </div>
          </section>
        </div>
      </div>
      <SafetyButton buttonText="내 정부지원금 확인하기" onClick={nextBtn} />
      <Footer />
    </>
  );
}

export default DisasterMain;
