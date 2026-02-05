import React, { useState } from "react";
import ClaimSubHeaders from "../components/ClaimSubHeaders";
import styles from "../../../css/claim/claimContractInfo.module.css";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ClaimUtilsApi from "../../../data/ClaimUtilsApi";

function ClaimContractInfo() {
  ClaimUtilsApi();
  const insurances = useSelector((state) => state.insurance.insurances);
  const navigate = useNavigate();
  const name = insurances.name || "";
  const data = Array.isArray(insurances.Insurances)
    ? insurances.Insurances
    : [];
  const [isActive, setIsActive] = useState(0);
  const btnArray = ["정상", "만기"];

  const currentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 데이터를 최신순으로 정렬
  const sortedData = data?.slice().sort((a, b) => {
    const dateA = new Date(a.Contract?.insurance_start_date);
    const dateB = new Date(b.Contract?.insurance_start_date);
    return dateB - dateA;
  });

  const expiredData = sortedData.filter(
    (item) =>
      new Date(item?.Contract?.insurance_end_date) < new Date(currentDate())
  );

  const activeData = sortedData.filter(
    (item) =>
      new Date(item?.Contract?.insurance_end_date) >= new Date(currentDate())
  );

  const handleDetailClick = (id) => {
    const selectedInsurance = data?.find((item) => item.id === id);
    navigate(`/claimContractInfo/${id}`, {
      state: { selectedInsurance },
    });
  };

  const handleLinkClick = (event) => {
    event.stopPropagation();
  };

  // 여행 국가 코드에 따른 보험 상품명 가져오기
  const getInsuranceTitle = (item) => {
    if (!item || !item.Contract) return "여행 보험";

    const tripCountry = item.Contract.trip_country;

    // Product 정보가 있으면 실제 상품명 사용
    if (item.Contract.Product && item.Contract.Product.product_nm) {
      return item.Contract.Product.product_nm;
    }

    // 국가 코드로 상품 타입 추정
    return tripCountry === "KR00" ? "국내여행보험" : "해외여행 실손의료보험";
  };

  return (
    <>
      <ClaimSubHeaders titleText="계약조회" />
      <div className={styles.ClaimContractInfo}>
        <div className={styles.ClaimContractInfoWrap}>
          <h3>계약정보를 확인하세요.</h3>
          <section>
            <div className={styles.btnWrap}>
              {btnArray.map((text, index) => (
                <button
                  key={index}
                  className={`${styles.buttons} ${
                    isActive === index ? styles.active : ""
                  }`}
                  onClick={() => setIsActive(index)}
                >
                  {text}
                </button>
              ))}
            </div>
            <div className="w-full">
              {sortedData.length > 0 ? (
                isActive === 0 ? (
                  <div>
                    {activeData.map((item, index) => {
                      return (
                        <div
                          className={styles.dataContentsWrap}
                          key={index}
                          onClick={() => handleDetailClick(item.id)}
                        >
                          <div className={styles.dataContentsBox}>
                            <div className={styles.dataContentsBoxTitleWrap}>
                              <div
                                className={styles.dataContentsBoxTitleFlexRow}
                              >
                                <p>{getInsuranceTitle(item)}</p>
                                <span className="bg-[#38b144]">정상</span>
                              </div>
                              <a
                                href={item?.Card?.goKlip}
                                onClick={handleLinkClick}
                              >
                                <button>NFT 보러가기</button>
                              </a>
                            </div>
                            <div className={styles.boundaryLineWrap}>
                              <div className={styles.boundaryLine}></div>
                            </div>
                            <div className={styles.userInfoList}>
                              <ul>
                                <li>
                                  <p>계약자</p>
                                  <span>
                                    {item?.Contract.User?.contractor_name}
                                  </span>
                                </li>
                                <li>
                                  <p>피보험자</p>
                                  <span>{name}</span>
                                </li>
                                <li>
                                  <p>보험기간</p>
                                  <span className="flex gap-[1px]">
                                    {item?.Contract?.insurance_start_date} ~{" "}
                                    {item?.Contract?.insurance_end_date}
                                  </span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div>
                    {expiredData.map((item, index) => {
                      return (
                        <div
                          className={`${styles.dataContentsWrap} ${styles.disabled}`}
                          key={index}
                        >
                          <div
                            className={`${styles.dataContentsBox} ${styles.disabled}`}
                          >
                            <div className={styles.dataContentsBoxTitleWrap}>
                              <div
                                className={styles.dataContentsBoxTitleFlexRow}
                              >
                                <p>{getInsuranceTitle(item)}</p>
                                <span className="bg-[#b8b9bc]">만기</span>
                              </div>
                              <a
                                href={item?.Card?.goKlip}
                                onClick={handleLinkClick}
                              >
                                <button>NFT 보러가기</button>
                              </a>
                            </div>
                            <div className={styles.boundaryLineWrap}>
                              <div className={styles.boundaryLine}></div>
                            </div>
                            <div className={styles.userInfoList}>
                              <ul>
                                <li>
                                  <p>계약자</p>
                                  <span>
                                    {item?.Contract.User?.contractor_name}
                                  </span>
                                </li>
                                <li>
                                  <p>피보험자</p>
                                  <span>{name}</span>
                                </li>
                                <li>
                                  <p>보험기간</p>
                                  <span className="flex gap-[1px]">
                                    {item?.Contract?.insurance_start_date} ~{" "}
                                    {item?.Contract?.insurance_end_date}
                                  </span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                <p>조회된 데이터가 없습니다.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default ClaimContractInfo;
