import React, { useState } from "react";
import ClaimHeader from "../../claim/components/ClaimHeader";
import styles from "../../../css/claim//claimRevocation.module.css";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../../utils/currentDate";
import ErrorModal from "../../../components/modals/ErrorModal";

function ClaimRevocationAll() {
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState("desc"); // 초기 정렬 순서는 최신순
  const [showErrorModal, setShowErrorModal] = useState(false);
  const tokenData = useSelector((state) => state.insurance.insurances);
  const data = Array.isArray(tokenData.Insurances) ? tokenData.Insurances : [];
  const name = tokenData.name || "";

  const currentDate = formatDate(new Date());

  // 데이터를 필터링하여 만료된 보험과 현재 날짜에 개시된 보험을 제외합니다.
  const filteredData = data.filter((item) => {
    const endDate = formatDate(new Date(item.Contract?.insurance_end_date));
    const startDate = formatDate(new Date(item.Contract?.insurance_start_date));

    // 만료일이 현재보다 이후이고 시작일이 오늘이 아닌 경우만 표시
    return endDate > currentDate && startDate !== currentDate;
  });
  
  const convertToDate = (dateString) => {
    return new Date(dateString);
  };
  const sortedData = filteredData.slice().sort((a, b) => {
    const dateA = convertToDate(a.Contract.insurance_start_date);
    const dateB = convertToDate(b.Contract.insurance_start_date);
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  const handleSortOrderChange = (order) => {
    setSortOrder(order);
  };

  const handleSlideClick = (id, deletable) => {
    if (!deletable) {
      setShowErrorModal(true);
      return;
    }
    navigate(`/claimRevocation/${id}`);
  };

  return (
    <>
      <ClaimHeader titleText="보험 가입 취소" />
      <div className={styles.Wrappers}>
        <section className={styles.sections}>
          <div className={styles.titleWrap}>
            <h3 className={styles.titles}>가입내역서</h3>
            <div className={styles.filterBtn}>
              <span
                onClick={() => handleSortOrderChange("desc")}
                className={
                  sortOrder === "desc" ? styles.activeBtnText : styles.btnText
                }
              >
                최신순
              </span>
              <span>|</span>
              <span
                onClick={() => handleSortOrderChange("asc")}
                className={
                  sortOrder === "asc" ? styles.activeBtnText : styles.btnText
                }
              >
                과거순
              </span>
            </div>
          </div>
          <div className={styles.slideWrapper}>
            {sortedData.map((item) => (
              <div
                key={item.id}
                onClick={() =>
                  handleSlideClick(item?.Contract.id, item.deletable)
                }
                className={styles.cardItems}
              >
                <div className={styles.slideContents}>
                  <h3>{item?.Product?.product_nm}</h3>
                  <div className={styles.boundaryWrap}>
                    <div className={styles.boundary}></div>
                  </div>
                  <div className={styles.userInfoConents}>
                    <ul>
                      <li>
                        <span>견적번호</span>
                        <p>{item.Contract.group_no}</p>
                      </li>
                      <li>
                        <span>보험기간</span>
                        <p>
                          {item.Contract.insurance_start_date} ~{" "}
                          {item.Contract.insurance_end_date}
                        </p>
                      </li>
                      <li>
                        <span>계약자</span>
                        <p>{item.Contract.User?.contractor_name}</p>
                      </li>
                      <li>
                        <span>피보험자</span>
                        <p>{name}</p>
                      </li>
                      <li>
                        <span>환급보험료</span>
                        <p>{item.Contract.total_premium}</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        {showErrorModal && (
          <ErrorModal
            onClose={() => {
              setShowErrorModal(false);
            }}
            message="동반가입자 취소 불가능"
            subMsg="단체 보험상품으로 동반가입자 보험이 일괄 취소되므로, 가입하신 계약자만 취소가 가능합니다."
          />
        )}
      </div>
    </>
  );
}

export default ClaimRevocationAll;
