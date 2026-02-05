import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../../css/claim/claimMain2.module.css";
import MainSlick from "./MainSlick";
import Footer from "../../../components/footer/Footer";
import { fetchData } from "../../../data/ClaimUtilsApi";
import SuccessModal from "../../../components/modals/SuccessModal";
import SuggestionModal from "../../../components/modals/SuggestionModal";
import {
  setInsurance,
  setCookie,
  setBirthSecondPart,
  setMembersData,
  logout,
  setIsFromCsvUpload,
} from "../../../redux/store";

function ClaimMain() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loggedIn = useSelector((state) => state.auth.isAuthenticated);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);

  useEffect(() => {
    if (loggedIn) {
      fetchData(dispatch);
    }
  }, [loggedIn, dispatch]);

  const navigateAnnonuce = () => {
    navigate("/claimFAQ");
  };

  const handleProtectedAction = async (action) => {
    if (loggedIn) {
      action();
    } else {
      navigate("/login");
    }
  };

  const handleNormalInsurance = () => {
    dispatch(setIsFromCsvUpload(false));
    window.location.href = "https://abc.retrust.world/overseas";
  };

  const handleDepartedInsurance = () => {
    dispatch(setIsFromCsvUpload(false));
    window.location.href = "https://abc.retrust.world/departed";
  };

  const handleGroupQuote = () => {
    dispatch(setIsFromCsvUpload(false));
    window.location.href = "https://abc.retrust.world/overseas/upload";
  };

  const handleReJoin = () => {
    dispatch(setIsFromCsvUpload(false));
    if (loggedIn) {
      window.location.href = "https://abc.retrust.world/overseas";
    } else {
      navigate(
        `/login?redirect=${encodeURIComponent(
          "https://abc.retrust.world/overseas"
        )}`
      );
    }
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirmModal(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      // 먼저 Redux 상태 초기화
      dispatch(logout());
      dispatch(setInsurance(null));
      dispatch(setCookie(null));
      dispatch(setBirthSecondPart(""));
      dispatch(setMembersData(null));

      // 세션스토리지 초기화
      sessionStorage.removeItem("reduxState");

      // 서버 로그아웃 호출
      await fetch(`${process.env.REACT_APP_BASE_URL}/trip-api/auth/logout`, {
        method: "POST",
      });

      setShowLogoutConfirmModal(false);
      // 로그아웃 성공 모달 표시
      setShowLogoutModal(true);
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirmModal(false);
  };

  const handleModalClose = () => {
    // 세션스토리지 초기화
    sessionStorage.removeItem("reduxState");
    dispatch(logout()); // auth 상태 초기화
    dispatch(setInsurance(null)); // insurance 상태 초기화
    dispatch(setCookie(null)); // cookie 상태 초기화
    dispatch(setBirthSecondPart("")); // birthSecondPart 초기화
    dispatch(setMembersData(null)); // membersData 초기화
    // 모달 닫기
    setShowLogoutModal(false);
    // 로그인 페이지로 이동
    navigateToHome();
  };

  const handleMenuItemClick_private = (link) => {
    if (link === "/claimFAQ") {
      navigate(link);
      return;
    }

    handleProtectedAction(() => {
      switch (link) {
        case "/claimContractInfo":
        case "/claimRevocation":
        case "/claimMembersIntro":
        case "/claimConfirm":
        case "/trip":
          if (loggedIn) {
            navigate(link);
          } else {
            navigate(`/Login?redirect=${encodeURIComponent(link)}`);
          }
          break;
        default:
          navigate(link);
          break;
      }
    });
  };

  const handleAdditionalServiceClick_public = (link) => {
    switch (link) {
      case "groupQuote":
        handleGroupQuote();
        break;
      case "reJoin":
        handleReJoin();
        break;
      case "/emergencySupport":
      case "/claimReferral":
        navigate(link);
        break;
      default:
        navigate(link);
        break;
    }
  };

  const menuItems = [
    {
      title: "계약 조회",
      icon: "/images/contract.png",
      link: "/claimContractInfo",
    },
    {
      title: "도착일 변경",
      icon: "/images/calendars.png",
      link: "/claimExtendDate",
    },
    {
      title: "보험금 청구",
      icon: "/images/payment.png",
      link: "/claimMembersIntro",
    },
    {
      title: "청구 확인",
      icon: "/images/searchs.png",
      link: "/claimConfirm",
    },
    {
      title: "가입 취소",
      icon: "/images/cancels.png",
      link: "/claimRevocation",
    },
    {
      title: "FAQ",
      icon: "/images/main_faq.png",
      link: "/claimFAQ",
    },
  ];

  const additionalServices = [
    { title: "단체견적", link: "groupQuote" },
    { title: "재가입", link: "reJoin" },
    { title: "고객센터", link: "/emergencySupport" },
    { title: "엽서보내기", link: "/claimReferral" },
  ];

  return (
    <div className={styles.mainContainer}>
      <div className={styles.contentsHeader}>
        <div className={styles.headerWrap}>
          <div className={styles.headerContent}>
            <div className={styles.spacer}></div>
            <div className={styles.logo}>
              <Link to="/">
                <img src="/images/insuRETrust.png" alt="insuRETrust" />
              </Link>
            </div>
            <div className={styles.LoginContents}>
              <img
                src="/images/bells.png"
                alt="notifications"
                onClick={navigateAnnonuce}
                className={styles.bellIcon}
              />
              {loggedIn ? (
                <img
                  src="/images/logout.png"
                  alt="logout"
                  onClick={handleLogoutClick}
                  style={{ cursor: "pointer" }}
                />
              ) : (
                <img
                  src="/images/login.png"
                  alt="login"
                  onClick={handleLoginClick}
                  style={{ cursor: "pointer" }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sectionTop}>
        <div className={styles.sectionTopBanner}>
          {loggedIn ? (
            <MainSlick />
          ) : (
            <img src="/images/MainTopBanner.png" alt="메인 배너" />
          )}
          <div className={styles.signUpContainer}>
            <div className={styles.signUpContents}>
              <div
                className={styles.signUpcontentsBox}
                onClick={handleNormalInsurance}
              >
                <div className={styles.signUpcontentsBoxTitle}>
                  <div className={styles.boxTitle}>
                    <p>
                      해외 여행자
                      <br />
                      보험 가입
                    </p>
                  </div>
                  <div className={styles.signUpSpot}>
                    <span>베스트</span>
                  </div>
                </div>
                <p className={styles.signUpcontentsDesc}>
                  개인·단체 모두 간편하게 !
                  <br />
                  초실속 플랜부터 럭셔리 플랜까지
                </p>
              </div>
              <div
                className={styles.signUpcontentsBox}
                onClick={handleDepartedInsurance}
              >
                <div className={styles.signUpcontentsBoxTitle}>
                  <div className={styles.boxTitle}>
                    <p>
                      출국 후<br />
                      보험 가입
                    </p>
                  </div>
                  <div className={styles.signUpSpot}>
                    <span>인기 급상승</span>
                  </div>
                </div>
                <p className={styles.signUpcontentsDesc}>
                  이미 여행 중이신가요?
                  <br />
                  지금 안심하고 가입하세요
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sectionMenu}>
        <div className={styles.menuContents}>
          <div className={styles.menuContentsTitle}>
            <p>자주 찾는 메뉴</p>
          </div>
          <div className={styles.gridContents}>
            {menuItems.map((item, index) => (
              <div
                key={index}
                className={styles.menuItem}
                onClick={() => handleMenuItemClick_private(item.link)}
              >
                <div className={styles.menuIconWrapper}>
                  <img src={item.icon} alt={item.title} />
                </div>
                <p className={styles.menuText}>{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.sectionService}>
        <div className={styles.serviceWrap}>
          <div className={styles.serviceTitle}>
            <p>부가서비스</p>
          </div>
          <div className={styles.serviceBtn}>
            <ul>
              {additionalServices.map((service, index) => (
                <li
                  key={index}
                  onClick={() =>
                    handleAdditionalServiceClick_public(service.link)
                  }
                >
                  {service.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {showLogoutConfirmModal && (
        <SuggestionModal
          message="로그아웃 하시겠습니까?"
          onConfirm={handleLogoutConfirm}
          onCancel={handleLogoutCancel}
          confirmButtonText="확인"
          cancelButtonText="취소"
        />
      )}

      {showLogoutModal && (
        <SuccessModal message="로그아웃이" onClose={handleModalClose} />
      )}
      <Footer />
    </div>
  );
}

export default ClaimMain;
