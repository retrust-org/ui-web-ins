import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../../../css/disasterHouse/address.module.css";
import search from "../../../../assets/address-serch.svg";
import coverageSupport from "../../../../assets/safeGuard-support.svg";
import AnnounceContentsImages from "../../../../assets/supportDetail-2.svg";
import addressHouse from "../../../../assets/address-house.png";
import AgreeModal from "../components/AgreeModal";
import DisasterMainHeader from "../../../../components/headers/DisasterMainHeader";
import BaseModalCenter from "../../../../components/layout/BaseModalCenter";

function Address() {
    const navigate = useNavigate();

    // 모달 상태 관리
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(true);

    // 첫 렌더링 시 가입대상 확인 모달 표시
    useEffect(() => {
        setIsConfirmModalOpen(true);
    }, []);

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
        navigate("/address/search");
    };

    return (
        <>
            <DisasterMainHeader title="풍수해" />
            <div className={styles.addressContainer}>
                <section className={styles.titleSection}>
                    <div className={styles.title}>
                        <h2 className={styles.mainTitle}>우리 집 안전하게 지켜요</h2>
                        <h3 className={styles.subTitle}>
                            실손 비례보상 주택 풍수해 지진재해 보험{" "}
                        </h3>
                    </div>
                </section>
                <section className={styles.imageSearchSection}>
                    <div className={styles.imageWrapper}>
                        <img src={addressHouse} alt="house" />
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
            {/* 모달 컴포넌트에 동의 후 이동 핸들러 전달 */}
            <AgreeModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onAgree={handleAgreeAndNavigate}
            />

            {/* 가입대상 확인 모달 */}
            <BaseModalCenter
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
            >
                <div className={styles.confirmModal}>
                    <h2 className={styles.confirmModalTitle}>가입대상 확인</h2>
                    <p className={styles.confirmModalContent}>
                        실손비례보상 주택풍수해 지진재해 보험은 <span>소유자에 한해서</span> 가입이 가능해요!
                    </p>
                    <button
                        className={styles.confirmModalButton}
                        onClick={() => setIsConfirmModalOpen(false)}
                    >
                        확인
                    </button>
                </div>
            </BaseModalCenter>
        </>
    );
}

export default Address;
