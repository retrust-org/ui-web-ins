import { useState, useEffect } from "react";
import styles from "../../css/common/sideNav.module.css";
import backIcon from "../../assets/backIcon-white.svg";
import DownChk from "../../assets/DownChk.svg";
import menuButton from "../../assets/menuButton.svg";
import { useSelector } from "react-redux";

function SideNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const token = useSelector((state) => state.cookie.cookie);

  // 세션 스토리지에서 로그인 상태 확인
  useEffect(() => {
    const storedState = sessionStorage.getItem("reduxState");
    if (storedState) {
      try {
        const parsedState = JSON.parse(storedState);
        if (parsedState.auth && parsedState.auth.isAuthenticated) {
          setLoggedIn(true);
        }
      } catch (e) {
        console.error("세션 스토리지 파싱 에러", e);
      }
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  // 공개 페이지 이동 핸들러
  const handlePublicNavigation = (path) => {
    window.location.href = path;
  };

  // 로그인 필요한 페이지 이동 핸들러
  const handleProtectedNavigation = (path) => {
    if (loggedIn) {
      window.location.href = path;
    } else {
      // 로그인 페이지로 리디렉션하고 원래 가려던 경로를 쿼리 파라미터로 전달
      window.location.href = `/claim/login?redirect=${encodeURIComponent(
        path
      )}`;
    }
  };

  const menuItems = [
    {
      title: "보험가입",
      description: "해외여행/출국후여행/장기체류/국내여행",
      subItems: [
        "해외여행보험",
        "출국후여행보험",
        "장기체류보험",
        "국내여행보험",
      ],
      links: [
        "/trip/overseas",
        "/trip/departed",
        "/trip/longterm",
        "/trip/domestic",
      ],
      isProtected: [false, false, false, false], // 기존 링크가 있어서 공개 페이지
    },
    {
      title: "계약관리",
      description: "가입증명서/계약변경/계약취소/계약조회",
      subItems: ["가입증명서 발급", "계약변경", "계약취소", "계약조회"],
      links: [
        "/claimContractInfo",
        "/claimExtendDate",
        "/claimRevocation",
        "/claimContractInfo",
      ],
      isProtected: [true, true, true, true], // 기존 링크 없어서 모두 로그인 필요
    },
    {
      title: "보험금 청구",
      description: "청구하기/청구확인",
      subItems: ["보험금 청구하기", "청구현황 확인"],
      links: ["/claimMembersIntro", "/claimConfirm"],
      isProtected: [true, true], // 기존 링크 없어서 모두 로그인 필요
    },
    {
      title: "부가서비스",
      description: "엽서보내기",
      subItems: ["엽서보내기"],
      links: ["/claimReferral"],
      isProtected: [true], // 기존 링크 없어서 로그인 필요
    },
    {
      title: "고객센터",
      description: "고객 콜센터/24시간 우리말서비스",
      subItems: ["고객 콜센터", "24시간 우리말서비스"],
      links: ["/claim/emergencySupport", "/claim/emergencySupport"],
      isProtected: [false, false], // 고객센터는 공개 페이지
    },
  ];

  // 서브메뉴 클릭 핸들러
  const handleSubMenuClick = (itemIndex, subIndex) => {
    const item = menuItems[itemIndex];
    const link = item.links[subIndex];
    const isProtected = item.isProtected[subIndex];

    if (isProtected) {
      handleProtectedNavigation(link);
    } else {
      handlePublicNavigation(link);
    }
  };

  return (
    <div className={styles.sideNavContainer}>
      {/* 햄버거 버튼 */}
      <img src={menuButton} alt="menuButton" onClick={toggleMenu} />

      {/* 오버레이 */}
      {isMenuOpen && <div className={styles.overlay} onClick={toggleMenu} />}

      {/* 사이드 네비게이션 */}
      <div
        className={`${styles.sideNavWrapper} ${
          isMenuOpen ? styles.sideNavOpen : styles.sideNavClosed
        }`}
      >
        <div className={styles.navContainer}>
          <section className={styles.navHeader}>
            <img src={backIcon} alt="backIcon" onClick={toggleMenu} />
            <div className={styles.navHeaderWrap}>
              <div
                className={styles.HeadTitle}
                onClick={
                  !loggedIn
                    ? () => (window.location.href = "/claim/login?redirect=%2F")
                    : undefined
                }
                style={!loggedIn ? { cursor: "pointer" } : {}}
              >
                <h2>
                  {loggedIn
                    ? `안녕하세요, ${token.name}님`
                    : "본인인증을 진행해주세요"}
                </h2>
                <p>보험업무 시에 필요합니다</p>
              </div>
            </div>
          </section>
          <section className={styles.navContents}>
            <div className={styles.navList}>
              <ul>
                {menuItems.map((item, index) => (
                  <li key={index} className={styles.menuItem}>
                    <div
                      className={styles.menuHeader}
                      onClick={() => toggleAccordion(index)}
                    >
                      <div className={styles.menuTitle}>
                        <h3>{item.title}</h3>
                        {item.description && <p>{item.description}</p>}
                      </div>
                      <img
                        src={DownChk}
                        alt="DownChk"
                        className={`${styles.menuIcon} ${
                          openAccordion === index ? styles.menuIconRotated : ""
                        }`}
                      />
                    </div>

                    {/* 아코디언 서브메뉴 - 항상 렌더링하고 CSS로 제어 */}
                    <div
                      className={`${styles.subMenu} ${
                        openAccordion === index
                          ? styles.subMenuOpen
                          : styles.subMenuClosed
                      }`}
                    >
                      <div className={styles.subMenuContent}>
                        {item.subItems.map((subItem, subIndex) => (
                          <button
                            key={subIndex}
                            className={styles.subMenuItem}
                            onClick={() => handleSubMenuClick(index, subIndex)}
                          >
                            {subItem}
                          </button>
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default SideNav;
