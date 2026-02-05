import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../../../css/disasterSafeguard/address.module.css";
import search from "../../../../assets/address-serch.svg";
import coverageSupport from "../../../../assets/safeGuard-support.svg";
import peoples from "../../../../assets/address-people.svg";
import AnnounceContentsImages from "../../../../assets/supportDetail-2.svg";
import AgreeModal from "../../components/AgreeModal";
import EmployeeCountModal from "./EmployeeCountModal";
import SafetyGuardHeader from "../../../../components/headers/SafetyGuardHeader";

function Address() {
  const navigate = useNavigate(); // 라우팅을 위한 Hook

  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmployeeCountModalOpen, setIsEmployeeCountModalOpen] = useState(false);

  // 모달 열기 함수
  const openModal = () => {
    setIsModalOpen(true);
  };

  // 모달 닫기 함수
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 동의 후 주소 검색 페이지로 이동하는 핸들러
  const handleAgreeAndNavigate = () => {
    closeModal();
    navigate("/address/search"); // 주소 검색 페이지로 이동
  };

  // 사원수 조사 모달 닫기 함수
  const closeEmployeeCountModal = () => {
    setIsEmployeeCountModalOpen(false);
  };

  // 첫 렌더링 시 사원수 조사 모달 열기
  useEffect(() => {
    setIsEmployeeCountModalOpen(true);
  }, []);

  return (
    <>
      <SafetyGuardHeader title="풍수해" />
      <div id={styles.AddressContainer}>
        <div className={styles.AddressContainerWrap}>
          <section className={styles.titleSection}>
            <div className={styles.title}>
              <h2 className={styles.mainTitle}>사장님들 ! 여기여기 모여라</h2>
              <h3 className={styles.subTitle}>
                실손보상 소상공인 풍수해·지진재해보험{" "}
              </h3>
            </div>
          </section>
          <section className={styles.searchSection}>
            <div className={styles.imagesWrap}>
              <img src={peoples} alt="peoples" />
            </div>
            <div className={styles.searchContents}>
              <div className={styles.governmentSupportWrap}>
                <div className={styles.governmentSupport}>
                  <p>국가 및 지자체 지원 보험</p>
                  <img src={coverageSupport} alt="coverageSupport" />
                </div>
              </div>
              <div className={styles.searchBox}>
                <div className={styles.customInputWrap}>
                  <div className={styles.customInput} onClick={openModal}>
                    <p>사업장 주소 검색</p>
                    <img src={search} alt="search" />
                  </div>
                </div>
                <div className={styles.searchBoxAnnounce}>
                  <div className={styles.AnnounceContents}>
                    <img
                      src={AnnounceContentsImages}
                      alt="AnnounceContentsImages"
                    />
                    <ul>
                      <li>건축물 대장을 통해 정보를 불러와드려요</li>
                      <li>복잡한 서류없이 주소검색 한 번이면 돼요</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      {/* 모달 컴포넌트에 동의 후 이동 핸들러 전달 */}
      <AgreeModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onAgree={handleAgreeAndNavigate}
      />

      {/* 사원수 조사 모달 */}
      <EmployeeCountModal isOpen={isEmployeeCountModalOpen} onClose={closeEmployeeCountModal} />
    </>
  );
}

export default Address;
