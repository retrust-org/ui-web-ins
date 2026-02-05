import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import ClaimHeader from "../../claim/components/ClaimHeader";
import styles from "../../../css/claim/claimContractDetail.module.css";
import { useSelector } from "react-redux";
import claimMainContract_check from "../../../assets/claimMainContract_check.svg";

function ClaimContractDetail() {
  const numberWithCommas = (x) => {
    if (!x) return "";
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  const modifyCertUrltoEn = (url) => {
    return url.replace("otptDiv=A", "otptDiv=B");
  };
  const location = useLocation();
  // location.state에서 필요한 state 값을 추출
  const { selectedInsurance } = location.state;
  console.log(selectedInsurance);
  const cardLink = selectedInsurance?.Contract?.certificate_view_url;
  const cardLinkEn = modifyCertUrltoEn(cardLink);

  const token = useSelector((state) => state.cookie.cookie);
  const userName = token?.name || "";
  const btnFilterArray = ["기본정보", "가입 증명서"];
  const [isActive, setIsActive] = useState(0);

  const basicInfo = {
    productCode: selectedInsurance.Contract.product_cd,
    productName: selectedInsurance.Contract.Product.product_nm || "",
    contractNumber: selectedInsurance.Contract.MasterPolicy.policy_no || "",
    insurancePeriod: selectedInsurance
      ? `${selectedInsurance.Contract.insurance_start_date} ~ ${selectedInsurance.Contract.insurance_end_date}`
      : "",
    contractor: selectedInsurance ? selectedInsurance.contractor : "",
    price: selectedInsurance
      ? `${numberWithCommas(selectedInsurance.insurance_premium)}원`
      : "",
  };

  console.log(basicInfo, "베이스인포데이터");

  // 보장내용에서 표시할 데이터
  const coverageInfo = {
    claimProcedure: selectedInsurance ? "보험금 청구 절차 내용" : "",
    insuranceTarget: selectedInsurance ? "보험 가입 대상 내용" : "",
    // 추가 필드에 대한 처리
  };

  return (
    <>
      <ClaimHeader titleText="계약조회" />
      <div className={styles.section}>
        <div className={styles.sectionWrap}>
          <h3>{basicInfo.productName}</h3>
          <div className={styles.insuPriceContents}>
            <div className={styles.insuPriceContentsWrap}>
              <div className={styles.insuPriceFlexCol}>
                <div className={styles.contentsFlexRow}>
                  <p>보험료(일시납)</p>
                  <span>정상</span>
                </div>
                <span className={styles.span}>{basicInfo.price}</span>
              </div>
            </div>
          </div>
          <div className={styles.section_2nd}>
            <div className={styles.insuUserInfo}>
              <div className={styles.filterBtnContents}>
                <ul>
                  {btnFilterArray.map((e, i) => {
                    return (
                      <li
                        key={i}
                        className={`${
                          isActive === i ? styles.active : styles.non_active
                        }`}
                        onClick={() => {
                          setIsActive(i);
                        }}
                      >
                        {e}
                      </li>
                    );
                  })}
                </ul>
              </div>
              {isActive === 0 && (
                <div className={styles.userInfoCard}>
                  <p>기본정보</p>
                  <div className={styles.userBasicInfoBox}>
                    <div className={styles.userBasicInfoBoxWrap}>
                      <ul>
                        <li>
                          <span>증권번호</span>
                          <p>{basicInfo.contractNumber}</p>
                        </li>
                        <li>
                          <span>보험기간</span>
                          <p>{basicInfo.insurancePeriod}</p>
                        </li>
                        {/* <li>
                          <span>계약자</span>
                          <p>
                            {selectedInsurance.Contract.User?.contractor_name}
                          </p>
                        </li> */}
                        <li>
                          <span>피보험자</span>
                          <p>{userName}</p>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className={styles.userPayInfo}>
                    <p>담당자</p>
                    <div className={styles.userBasicInfoBox}>
                      <div className={styles.userBasicInfoBoxWrap}>
                        <ul>
                          <li>
                            <span>이름</span>
                            <p>(주)리트러스트</p>
                          </li>
                          <li>
                            <span>소속</span>
                            <p>기업영업2본부</p>
                          </li>
                          <li>
                            <span>연락처</span>
                            <p>{process.env.REACT_APP_TEL_NO}</p>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {isActive === 1 && (
                <div className={styles.cardsList}>
                  {basicInfo.productCode === "15540" ? (
                    // 15540 상품인 경우 국문과 영문 증명서 모두 표시
                    <>
                      <div className={styles.userInfoCards}>
                        <a
                          href={`${cardLink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <div className={styles.cardLinks}>
                            <img src={claimMainContract_check} alt="doc" />
                            <p>국문 증명서</p>
                          </div>
                        </a>
                      </div>
                      <div className={styles.userInfoCards}>
                        <a
                          href={`${cardLinkEn}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <div className={styles.cardLinks}>
                            <img src={claimMainContract_check} alt="doc" />
                            <p>영문 증명서</p>
                          </div>
                        </a>
                      </div>
                    </>
                  ) : (
                    // 그 외 상품은 가입 증명서만 표시
                    <div className={styles.userInfoCards}>
                      <a
                        href={`${cardLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className={styles.cardLinks}>
                          <img src={claimMainContract_check} alt="doc" />
                          <p>가입 증명서</p>
                        </div>
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ClaimContractDetail;
