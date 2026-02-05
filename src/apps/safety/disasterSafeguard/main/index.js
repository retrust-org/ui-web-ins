import React from "react";
import house from "../../../../assets/safeGuard-house.svg";
import category from "../../../../assets/safeGuard-category.svg";
import byMertiz from "../../../../assets/safeGuard-meritz.svg";
import coverageSupport from "../../../../assets/safeGuard-support.svg";
import supportDetail_1 from "../../../../assets/supportDetail-1.svg";
import supportDetail_2 from "../../../../assets/supportDetail-2.svg";
import supportDetail_3 from "../../../../assets/supportDetail-3.svg";
import damage from "../../../../assets/safeGuard-coverageMenu-1.svg";
import fixture from "../../../../assets/safeGuard-coverageMenu-2.svg";
import inventory from "../../../../assets/safeGuard-coverageMenu-3.svg";
import styles from "../../../../css/disasterSafeguard/index.module.css";
import SafetyButton from "../../../../components/buttons/SafetyButton";
import { useNavigate } from "react-router-dom";
import DisasterMainHeader from "../../../../components/headers/DisasterMainHeader";
import Footer from "../../../../components/footer/Footer";

function Main() {
  const navigate = useNavigate();
  const nextBtn = () => {
    navigate("/address");
  };

  return (
    <>
      <DisasterMainHeader title="소상공인 풍수해" />
      <div id={styles.container}>
        <div className={styles.containerWrap}>
          <section className={styles.mainSection}>
            <div className={styles.title}>
              <img src={house} alt="house" />
              <div className={styles.titleText}>
                <h1>
                  소중한 사업장 지킴이 <br /> <span>소상공인 풍수해보험</span>
                </h1>
                <img
                  src={byMertiz}
                  alt="byMertiz"
                  className={styles.meritzLogo}
                />
              </div>
            </div>
          </section>
          {/* <section className={styles.listSection}>
            <ul>
              <li>상품안내</li>
              <li>보험약관</li>
              <li>가입 전 확인사항</li>
            </ul>
          </section> */}
          <section className={styles.coverageSection}>
            <div className={styles.coverageContents}>
              <h2>국가 및 지자체 지원 보험</h2>
              <p>정부와 지자체가 지원해드려요 !</p>
              <img src={coverageSupport} alt="coverageSupport" />
            </div>
            <div className={styles.supportDetail}>
              <div className={styles.supportContents}>
                <img src={supportDetail_1} alt="" />
                <div className={styles.supportDetailText}>
                  <span>비용 부담없이 안전하게 사업하세요</span>
                  <h3>보험료 최소 55% 이상 지원</h3>
                </div>
              </div>
              <div className={styles.supportContents}>
                <img src={supportDetail_2} alt="" />
                <div className={styles.supportDetailText}>
                  <span>복잡한 서류 없이 쉽고 편하게 신청해요</span>
                  <h3>최소한의 정보로 간편가입</h3>
                </div>
              </div>
              <div className={styles.supportContents}>
                <img src={supportDetail_3} alt="" />
                <div className={styles.supportDetailText}>
                  <span>재난지원금보다 더 많이 보장 받아요</span>
                  <h3>복구비 기준액 대비 최대 90% 보장</h3>
                </div>
              </div>
            </div>
          </section>
          <section className={styles.citeSection}>
            <cite>
              준법감시인 심의필 제2025-광고-0000호(2025.00.00~2026.00.00)
            </cite>
          </section>
          <section className={styles.providerSection}>
            <h2>
              언제 일어날 지 모르는 <br />
              <span>각종 풍수해 대비해요</span>
            </h2>
            <div className={styles.providerSectionImage}>
              <img src={category} alt="providerSectionImage-category" />
            </div>
          </section>
          <section className={styles.disasterCoverage}>
            <h2>재해 발생 시 보장내용</h2>
            <div className={styles.coverageDetail}>
              <div className={styles.detailContents}>
                <h3>건물피해</h3>
                <ul>
                  <li>
                    <img src={damage} alt="damage" />
                  </li>
                  <li>
                    가게 건물에 <span>금이 갔거나 무너졌을 때</span>{" "}
                  </li>
                </ul>
              </div>
              <div className={styles.detailContents}>
                <h3>시설/집기</h3>
                <ul>
                  <li>
                    <img src={fixture} alt="fixture" />
                  </li>
                  <li>
                    카운터, 진열대, 의자, 테이블 등이
                    <br /> <span>파손되었다면 수리나 교체 비용</span>을 보장
                  </li>
                </ul>
              </div>
              <div className={styles.detailContents}>
                <h3>자산/재고</h3>
                <ul>
                  <li>
                    <img src={inventory} alt="inventory" />
                  </li>
                  <li>
                    창고에 보관 중이던 상품이나 원재료가
                    <br /> <span>물에 젖거나 파손</span>됐다면 보장해드려요
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
      <SafetyButton buttonText="내 정부지원금 확인하기" onClick={nextBtn} />
      <Footer />
    </>
  );
}

export default Main;
