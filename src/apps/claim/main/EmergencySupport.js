import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from "../../../css/claim/claimSupport.module.css";
import Footer from "../../../components/footer/Footer";
import SuggestionModal from "../../../components/modals/SuggestionModal";
import leftArrow from "../../../assets/commonLeftArrow.svg";

const EmergencySupport = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [confirmButtonText, setConfirmButtonText] = useState("로그인");
  const [returnUrl, setReturnUrl] = useState("/");
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const mrzUser = useSelector((state) => state.cookie.mrzUser);
  const navigate = useNavigate();

  const handleMedicalServiceClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      // 1. 비로그인 상태: 로그인 페이지로
      setConfirmButtonText("로그인");
      setReturnUrl("/login?redirect=/emergencySupport");
      setShowLoginModal(true);
    } else {
      // 2. 로그인 상태: mrzUser 체크
      if (mrzUser) {
        // 3-1. mrzUser가 있으면 바로 전화연결
        window.location.href = "tel:+8223602407";
      } else {
        // 3-2. mrzUser가 없으면 combine 페이지로
        setConfirmButtonText("통합인증");
        navigate("/combine", {
          state: { targetRoute: "/emergencySupport" },
        });
      }
    }
  };

  const handleLoginConfirm = () => {
    setShowLoginModal(false);
    navigate(returnUrl);
  };

  const handleModalCancel = () => {
    setShowLoginModal(false);
  };

  const handleBackClick = () => {
    navigate(-1);
    // window.location.href = process.env.REACT_APP_ABC_URL || "/";
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.imgWrap}>
          <img
            src={leftArrow}
            alt="Back"
            className={styles.backButton}
            onClick={handleBackClick}
          />
        </div>
        <div className={styles.mainContent}>
          <p className={styles.title}>무엇을 도와드릴까요?</p>
          <div className={styles.contentWrapper}>
            <div className={styles.content}>
              {/* 의료상담 서비스 */}
              <div className={styles.serviceCard}>
                <div className={styles.cardContent}>
                  <div className={styles.textContent}>
                    <h3 className={styles.cardTitle}>
                      연중무휴 24시간
                      <br />
                      우리말 서비스
                    </h3>
                    <p className={styles.cardDescription}>
                      해외에서 필요한 긴급 의료상담 전용
                    </p>
                  </div>
                  <svg
                    className={styles.icon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 4H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" />
                    <path d="M12 8v8" />
                    <path d="M8 12h8" />
                  </svg>
                </div>
                <button
                  onClick={handleMedicalServiceClick}
                  className={styles.callButton}
                >
                  의료상담 서비스 전화하기
                </button>
              </div>

              {/* 고객 콜센터 */}
              <div
                className={`${styles.serviceCard} ${styles.customerService}`}
              >
                <div className={styles.cardContent}>
                  <div className={styles.textContent}>
                    <h3 className={styles.cardTitle}>고객 콜센터</h3>
                    <p className={styles.cardDescription}>
                      문의사항을 친절히 도와드리겠습니다
                    </p>
                  </div>
                  <svg
                    className={styles.icon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    <path d="M12 7v.01" />
                    <path d="M16 7v.01" />
                    <path d="M8 7v.01" />
                  </svg>
                </div>
                <a
                  href="tel:82215663305"
                  className={`${styles.callButton} ${styles.grayButton}`}
                >
                  1566-3305
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.footerWrapper}>
        <Footer />
      </div>

      {showLoginModal && (
        <SuggestionModal
          message="해당 서비스는 통합인증 후 이용 가능합니다."
          onConfirm={handleLoginConfirm}
          onCancel={handleModalCancel}
          confirmButtonText={confirmButtonText}
          cancelButtonText="취소"
        />
      )}
    </div>
  );
};

export default EmergencySupport;
