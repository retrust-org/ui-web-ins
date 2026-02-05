import React, { useState } from "react";
import { useParams } from "react-router-dom";
import ClaimHeader from "../../claim/components/ClaimHeader";
import styles from "../../../css/claim/claimRevocationDetail.module.css";
import ClaimDeleteModal from "../cancel/ClaimDeleteModal";
import { useSelector } from "react-redux";
import ClaimButton from "../../../components/buttons/ClaimButton";

function ClaimRevocationDetail() {
  const { id } = useParams();
  const tokenData = useSelector((state) => state.insurance.insurances);

  const selectedItem = tokenData.Insurances.find(
    (item) => item.Contract.id === parseInt(id)
  );

  const formatNumberWithCommas = (numberString) => {
    if (!numberString) return "0";
    const number = parseInt(numberString);
    return number.toLocaleString();
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Contract가 있는지 확인 후 값을 렌더링
  const insuranceStartDate = selectedItem?.Contract?.insurance_start_date || "";
  const insuranceEndDate = selectedItem?.Contract?.insurance_end_date || "";
  const policyNo = selectedItem?.Contract?.MasterPolicy?.policy_no || "";
  const productName = selectedItem?.Contract?.Product?.product_nm || "";
  const totalPremium = selectedItem?.Contract?.total_premium || "";
  const insuredCount = parseInt(selectedItem?.Contract?.insured_count, 10) - 1;
  return (
    <>
      <ClaimHeader titleText="보험 가입 취소" />
      <div className={styles.Wrapper}>
        <h3 className={styles.title}>
          인슈어트러스트
          <br /> 가입내역확인
        </h3>
        <section className={styles.section}>
          <div className={styles.sectionContents}>
            <div className={styles.sectionContentsWrap}>
              <p className={styles.title}>{productName}</p>
              <div className={styles.boundary}></div>
              <div className={styles.userInfoListWrap}>
                <div className={styles.userInfoContents}>
                  <ul>
                    <li>
                      <p>증권번호</p>
                      <span>{policyNo}</span>
                    </li>
                    <li>
                      <p>계약자</p>
                      <span>{selectedItem.Contract.User?.contractor_name}</span>
                    </li>
                    <li>
                      <p>피보험자</p>
                      <span>
                        {insuredCount < 1
                          ? tokenData?.name
                          : `${tokenData?.name} 외 ${insuredCount}명`}{" "}
                      </span>
                    </li>
                    <li>
                      <p>여행기간</p>
                      <span>{`${insuranceStartDate} - ${insuranceEndDate}`}</span>
                    </li>
                    <li>
                      <p>보험료</p>
                      <span>{`${formatNumberWithCommas(totalPremium)}원`}</span>
                    </li>
                  </ul>
                  <div className={styles.PriceConents}>
                    <div className={styles.PriceConentsWrap}>
                      <p>환금보험료</p>
                      <span>{`${formatNumberWithCommas(totalPremium)}원`}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <ClaimButton
            buttonText="여행보험 가입 취소"
            onClick={handleOpenModal}
          />
        </section>
      </div>
      <ClaimDeleteModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedItem={selectedItem}
      />
    </>
  );
}

export default ClaimRevocationDetail;
