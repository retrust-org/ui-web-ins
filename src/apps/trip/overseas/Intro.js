import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/buttons/Button";
import styles from "../../../css/trip/intros.module.css";
import Footer from "../../../components/footer/Footer";
import IntroBanner from "../../../assets/IntroBanner.svg";
import MainHeader from "../../../components/headers/MainHeader";
import {
  COMPLIANCE_TEXT,
  REWARD_NOTICES,
  pointRewardGuides,
} from "../../../data/OverseasIntroText";
import IntroPopup from "../../../components/popup/IntroPopup";
import pointBanner from '../../../assets/pointBanner.svg'

function Intro({ setShowHeader, setShowbar }) {
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

      <div className={styles.ContentsSection} style={{ pointerEvents: isPopupLoading ? 'none' : 'auto' }}>
        <section className={styles.imgBoxSection}>
          <img src="/images/IntroBannerOld.png" alt="출국전 해외여행 메인베너" />
        </section>

        <section className={styles.imageContentsWrap}>
          {[
            "/images/introMainBanner.png",
            "/images/introMainBanner2.png",
            "/images/introMainBanner3.png",
            "/images/introMainBanner4.png",
          ].map((src, index) => (
            <img key={index} src={src} alt="출국전 보험 혜택" />
          ))}
        </section>
        <section>
          <div className={styles.textList}>
            <img src={pointBanner} alt="pointBanner" />
            <ul>
              <p className={styles.rewardTitle}>
                [리트러스트 포인트 리워드 프로모션 유의사항]
              </p>
              {REWARD_NOTICES.map((notice, index) => (
                <li key={index}>{notice}</li>
              ))}
            </ul>
            <ul>
              {pointRewardGuides.map((notice, index) => (
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

export default Intro; 