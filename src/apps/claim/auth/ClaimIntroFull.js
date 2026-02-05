import { useEffect } from "react";
import styles from "../../../css/claim/claimIntro.module.css";
import KlipLogin from "./KlipLogin";
import GoNice from "./GoNice";
import SocialLogin from "./SocialLogin";
import LeftArrow from "../../../assets/commonLeftArrow.svg";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useHomeNavigate } from "../../../hooks/useHomeNavigate";


function ClaimIntroFull() {
  const location = useLocation();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const currentSearch = new URLSearchParams(location.search);
  const returnPath = currentSearch.get("redirect");

  const { navigateToHome } = useHomeNavigate();

  const handleBackClick = () => {
    // detector/security_hero로 직접 이동
    window.location.href = `${window.location.origin}/detector/security_hero`;
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (returnPath) {
        // detector, doctor, police 등 외부 경로는 basename 없이 직접 이동
        if (returnPath.startsWith('/detector') ||
          returnPath.startsWith('/doctor') ||
          returnPath.startsWith('/police')) {
          window.location.href = `${window.location.origin}${returnPath}`;
        } else {
          window.location.href = `${window.location.origin}${window.basename}${returnPath}`;
        }
      } else {
        navigateToHome();
      }
    }
  }, [isAuthenticated, returnPath, navigateToHome]);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.contents}>
          <div className={styles.headers}>
            <img src={LeftArrow} alt="" onClick={handleBackClick} />
          </div>
          <div className={styles.contentsTitle}>
            <div className={styles.logo}>
              <img src="/images/insuRETrust.png" alt="insuRETrust" />
            </div>
            <p>
              <span>인증수단</span>을 선택해주세요.
            </p>
          </div>
          <div className={styles.normalLogin}>
            <GoNice />
            <KlipLogin />
          </div>
          <div className={styles.boundaryContents}>
            <div className={styles.line}></div>
            <p>또는</p>
            <div className={styles.line}></div>
          </div>
          <div className={styles.socialLoginContainers}>
            <ul>
              <SocialLogin />
            </ul>
          </div>
        </div>
      </div>

    </>
  );
}

export default ClaimIntroFull;