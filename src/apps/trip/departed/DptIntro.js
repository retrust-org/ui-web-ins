import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/buttons/Button";
import styles from "../../../css/trip/intros.module.css";
import Footer from "../../../components/footer/Footer";
import IntroBanner from "../../../assets/departedIntroBanner.svg";
import MainHeader from "../../../components/headers/MainHeader";
import {
  COMPLIANCE_TEXT,
  REWARD_NOTICES,
} from "../../../data/DptOverseasIntroText";
import IntroPopup from "../../../components/popup/IntroPopup";

function DepartedIntro({ setShowHeader, setShowbar }) {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [isPopupLoading, setIsPopupLoading] = useState(false);

  // 팝업 표시 여부 결정 - 렌더링 시 한 번만 실행
  useEffect(() => {
    const hideUntil = localStorage.getItem("introPopupHiddenUntil");
    const now = new Date().getTime();

    if (!hideUntil || now > parseInt(hideUntil)) {
      setIsPopupLoading(true); // 팝업 로딩 시작
      setShowPopup(true);
    }
  }, []);

  useEffect(() => {
    setShowHeader(false);
    setShowbar(false);
    return () => {
      setShowHeader(true);
      setShowbar(true);
    };
  }, [setShowHeader, setShowbar]);

  const handleNavigation = () => {
    if (isPopupLoading) return; // 팝업 로딩 중이면 클릭 무시
    navigate("/insert");
  };

  // 팝업 닫기
  const closePopup = () => {
    setShowPopup(false);
    setIsPopupLoading(false); // 팝업 로딩 완료
  };

  // 오늘 하루 보지 않기
  const hidePopupForToday = () => {
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);

    localStorage.setItem(
      "introPopupHiddenUntil",
      tomorrow.getTime().toString()
    );
    setShowPopup(false);
    setIsPopupLoading(false); // 팝업 로딩 완료
  };

  // 팝업 로딩 완료 콜백
  const handlePopupLoaded = () => {
    setIsPopupLoading(false);
  };

  return (
    <>
      <MainHeader />

      {/* 팝업 로딩 중 전체 화면 오버레이 */}
      {isPopupLoading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'transparent',
            zIndex: 999,
            pointerEvents: 'all'
          }}
        />
      )}

      {/* 조건부 팝업 표시 */}
      {showPopup && (
        <IntroPopup
          onClose={closePopup}
          onHideForToday={hidePopupForToday}
          onPopupLoaded={handlePopupLoaded}
        />
      )}

      <div className={styles.DepartedContentsSection} style={{ pointerEvents: isPopupLoading ? 'none' : 'auto' }}>
        <section className={styles.imgBoxSection}>
          <img src={IntroBanner} alt="출국후 해외여행 메인베너" />
        </section>

        <section className={styles.imageContentsWrap}>
          {[
            "/images/departedBanner.png",
            "/images/departedBanner2.png",
            "/images/departedBanner3.png",
            "/images/departedBanner4.png",
          ].map((src, index) => (
            <img key={index} src={src} alt="출국 후 보험 혜택" />
          ))}
        </section>

        <section>
          <div className={styles.textList}>
            <ul>
              {REWARD_NOTICES.map((notice, index) => (
                <li key={index}>{notice}</li>
              ))}
            </ul>
          </div>
          <cite className={styles.cite}>{COMPLIANCE_TEXT}</cite>
        </section>
      </div>
      <div className={styles.footerWrap} style={{ pointerEvents: isPopupLoading ? 'none' : 'auto' }}>
        <Footer />
      </div>
      <div style={{ pointerEvents: isPopupLoading ? 'none' : 'auto' }}>
        <Button buttonText="보험료 확인하기" onClick={handleNavigation} />
      </div>
    </>
  );
}

export default DepartedIntro;