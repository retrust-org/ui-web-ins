import { Link, useNavigate, useLocation } from "react-router-dom";
import commonLeftArrow from "../../assets/commonLeftArrow.svg";
import introHome from "../../assets/introHome.svg";
import styles from "../../css/common/header.module.css";
import { useSelector } from "react-redux";
import { useHomeNavigate } from '../../hooks/useHomeNavigate'; // 올바른 import

function Header({ isSticky }) {
  const navigate = useNavigate();
  const location = useLocation();
  const hasDeparted = useSelector((state) => state.hasDeparted.isDeparted);
  
  // Hook 올바르게 사용
  const { navigateToHome } = useHomeNavigate();

  const prevPage = () => {
    navigate(-1);
  };

  const getHeaderTitle = () => {
    const currentPath = location.pathname;

    if (!hasDeparted) {
      if (currentPath.includes("/trip")) {
        return "여행자 보험선택";
      }
      if (currentPath.includes("/signup")) {
        return "여행자 보험가입";
      }
    } else {
      if (currentPath.includes("/trip")) {
        return "출국 후 여행자 보험";
      }
      if (currentPath.includes("/signup")) {
        return "출국 후 여행자보험 가입";
      }
    }

    // 기본값 반환 (필요한 경우)
    return "여행자 보험";
  };

  return (
    <div className={`${styles.headers} ${isSticky ? "fixed " : ""}`}>
      <div className={styles.headersContents}>
        <div className={styles.headersContentsFlex}>
          {/* Left Arrow Icon */}
          <span onClick={prevPage}>
            <img src={commonLeftArrow} alt={commonLeftArrow} />
          </span>
          {/* Title Text */}
          <p>{getHeaderTitle()}</p>
          {/* Home Icon */}
          <div>
            <img src={introHome} alt={introHome} onClick={navigateToHome} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;