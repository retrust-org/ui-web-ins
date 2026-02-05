import headPhone from "../../assets/headPhone.svg";
import styles from "../../css/common/mainheader.module.css";
import { usePartner } from "../../hooks/usePartner";

function MainHeader() {
  // 파트너 정보 가져오기
  const { isB2B, partnerId, partnerConfig } = usePartner() || {};
  const baseUrl = process.env.REACT_APP_ABC_URL;

  // 파트너 여부에 따른 로고 이미지 결정
  const logoSrc = isB2B ? partnerConfig?.banner_url : "/images/insuRETrust.png";
  const logoAlt = isB2B ? partnerConfig?.name || "파트너 로고" : "insuRETrust";
  // 파트너 여부에 따른 CSS 클래스 결정
  const logoClassName = isB2B ? styles.logo : styles.mainLogo;

  return (
    <div className={styles.headerContainer}>
      <div className={styles.headerContent}>
        {/* flex-row, 세로정렬, 가로정렬, justify-contents: space-between */}
        <a href={isB2B ? `/${partnerId}` : "/"}>
          <img
            src={logoSrc}
            alt={logoAlt}
            className={logoClassName}
            onError={(e) => {
              console.log("로고 로드 실패:", e.target.src);
              if (!e.target.src.includes("/images/insuRETrust.png")) {
                e.target.src = "/images/insuRETrust.png";
                e.target.className = styles.mainLogo; // 로고 로드 실패 시 mainLogo 스타일 적용
              } else {
                e.target.onerror = null;
              }
            }}
          />
        </a>

        <img
          src={headPhone}
          alt="고객센터"
          className={styles.headPhone}
          onClick={() => {
            window.location.href = `${baseUrl + "/claim/claimFAQ"}`;
          }}
        />
      </div>
    </div>
  );
}

export default MainHeader;
