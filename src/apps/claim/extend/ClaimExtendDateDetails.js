import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import ClaimHeader from "../../claim/components/ClaimHeader";
import styles from "../../../css/claim/claimExtendDateDetails.module.css";
import confirmCheck from "../../../assets/confirmCheck.svg";

import ErrorModal from "../../../components/modals/ErrorModal";
import ClaimExtendModal from "./ClaimExtendModal";
import ClaimButton from "../../../components/buttons/ClaimButton";

function ClaimExtendDateDetails() {
  const { moid } = useParams();
  const location = useLocation();
  const data = location.state || [];
  const [isModal, setIsModal] = useState(false);
  const [isDataVisible, setIsDataVisible] = useState(false);
  const [filteredData, setFilteredData] = useState(null);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const currentDate = new Date().toISOString().slice(0, 10);
  const navigate = useNavigate();
  const message = "보험 만료 후에는\n도착일 변경이 불가능합니다.";

  const getGenderCode = (birth, gender) => {
    const year = parseInt(birth.substring(0, 4));
    const baseCode = year >= 2000 ? 2 : 0;
    return (baseCode + parseInt(gender)).toString();
  };

  const getGenderString = (genderCode) => {
    if (!genderCode) {
      return "성별선택";
    }
    return genderCode === "1" ? "남" : "여";
  };

  useEffect(() => {
    if (data.length) {
      const filtered = data.filter((item) => item.moid === moid);
      setFilteredData(filtered.length > 0 ? filtered[0] : null);
      if (filtered.length > 0 && filtered[0].insurance_end_date < currentDate) {
        setIsModal(true);
      }
    }
  }, [moid, data, currentDate]);

  const toggleDataVisibility = () => {
    setIsDataVisible(!isDataVisible);
  };

  const ModalClose = () => {
    setIsModal(false);
    navigate("/claimExtendDate");
  };

  const openExtendModal = () => {
    setShowExtendModal(true);
  };

  return (
    <>
      <ClaimHeader titleText="여행기간 도착일 변경" />
      <div className={styles.container}>
        <div className={styles.containerWrap}>
          <h3>연장 전 보험료를 확인해주세요.</h3>
          <div className={styles.contents}>
            <div className={styles.contentsWrap}>
              <span className={styles.title}>{filteredData?.product_name}</span>
              <div className={styles.boundary}></div>
              <div className={styles.section_DataContents}>
                <div className={styles.section_DataContentsWrap}>
                  <div className={styles.dataFlexbox}>
                    <p>출발 일정일</p>
                    <span>
                      {filteredData?.insurance_start_date || "정보 없음"}
                    </span>
                  </div>
                  <div className={styles.dataFlexbox}>
                    <p>도착 일정일</p>
                    <span>
                      {filteredData?.insurance_end_date || "정보 없음"}
                    </span>
                  </div>
                  <div className={styles.dataFlexbox}>
                    <p>가입자</p>
                    <div className={styles.dataFlexCol}>
                      <span>
                        {getGenderString(
                          String(filteredData?.insuredPersons[0].gender)
                        )}{" "}
                        (만 {filteredData?.insuredPersons[0].age}세) 외{" "}
                        {filteredData?.insuredPersons.length - 1}명
                      </span>
                    </div>
                  </div>
                  <div className={styles.section_cost}>
                    <div className={styles.section_costWrap}>
                      <p>변경 전 보험료</p>
                      <span>
                        {Number(
                          filteredData?.total_premium.replace(/[^0-9]/g, "")
                        ).toLocaleString()}
                        원
                      </span>
                      <img
                        src={confirmCheck}
                        className="cursor-pointer ml-2"
                        onClick={toggleDataVisibility}
                        alt="confirmCheck"
                      />
                    </div>
                    <div
                      className={`bg-white rounded-xl w-full ${
                        isDataVisible ? "" : "hidden"
                      } bg-opacity-0 py-4`}
                    >
                      <div className={styles.detailInfo}>
                        {filteredData?.insuredPersons.length > 0 &&
                          filteredData?.insuredPersons.map((user, index) => (
                            <div key={index} className={styles.TextFlex}>
                              <p>
                                {user.name}
                                {index === 0 && " (가입자)"}
                              </p>
                              <p>
                                {" "}
                                ({user.birth.substring(2)} -
                                {getGenderCode(user.birth, user.gender)}
                                ******)
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {isModal && <ErrorModal message={message} onClose={ModalClose} />}
        {showExtendModal && (
          <ClaimExtendModal
            filteredData={filteredData}
            onClose={() => setShowExtendModal(false)}
            isOpen={openExtendModal} // isOpen prop 추가
          />
        )}
        <ClaimButton buttonText="도착일 변경" onClick={openExtendModal} />
      </div>
    </>
  );
}

export default ClaimExtendDateDetails;
