import React, { useState, useEffect } from "react";
import styles from "../../css/home/home.module.css";
import Footer from "../../components/footer/Footer";
import MainHeader from "../../components/headers/MainHeader";
import overseasSvg from "../../assets/overseas.svg";
import departedSvg from "../../assets/departed.svg";
import longtermSvg from "../../assets/longterm.svg";
import domesticSvg from "../../assets/domestic.svg";
import virtualAssets from "../../assets/virtualAssets.svg";
import safetyGuardMainIcon from "../../assets/safetyGuard-mainIcon.svg";
import safetyHouseMainIcon from "../../assets/safetyHouse-mainIcon.svg";
import serviceSvg from "../../assets/service.svg";
import claimMenu1Svg from "../../assets/claimMenu1.svg";
import claimMenu2Svg from "../../assets/claimMenu2.svg";
import claimMenu3Svg from "../../assets/claimMenu3.svg";
import claimMenu4Svg from "../../assets/claimMenu4.svg";
import rightArrowSvg from "../../assets/rightArrow.svg";
import mainBannerImg from "../../assets/mainBanner.png";


function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeFilter, setActiveFilter] = useState("전체");

  // 상품 데이터 정의
  const products = [
    {
      id: "overseas",
      category: "여행",
      title: "해외여행",
      href: "/trip/overseas",
      image: overseasSvg,
      alt: "해외여행보험",
      description: "해외여행보험 - 출국 전 가입하는 해외여행 의료보험",
      ariaLabel: "해외여행보험 상품 페이지로 이동",
    },
    {
      id: "departed",
      category: "여행",
      title: "출국 후",
      href: "/trip/departed",
      image: departedSvg,
      alt: "출국 후 보험",
      description: "출국 후 보험 - 이미 출국한 상태에서도 가입 가능한 보험",
      ariaLabel: "출국 후 보험 상품 페이지로 이동",
    },
    {
      id: "longterm",
      category: "여행",
      title: "장기체류",
      href: "/trip/longterm",
      image: longtermSvg,
      alt: "장기체류보험",
      description: "장기체류보험 - 6개월 이상 해외 장기체류 전용",
      ariaLabel: "장기체류보험 상품 페이지로 이동",
    },
    {
      id: "domestic",
      category: "여행",
      title: "국내여행",
      href: "/trip/domestic",
      image: domesticSvg,
      alt: "국내여행보험",
      description: "국내여행보험 - 국내 여행에 필요한 저렴한 보험상품",
      ariaLabel: "국내여행보험 상품 페이지로 이동",
    },
    {
      id: "virtual",
      category: "가상자산",
      title: "가상자산",
      href: `${process.env.REACT_APP_ABC_URL}/detector/security_hero`,
      image: virtualAssets,
      alt: "가상자산보험",
      description: "가상자산보험",
      ariaLabel: "가상자산보험 상품 페이지로 이동",
    },
    {
      id: "safetyGuard",
      category: "화재/풍수해",
      title: "소상공인 풍수해",
      href: "/safety/disasterSafeguard/",
      image: safetyGuardMainIcon,
      alt: "소상공인 풍수해보험",
      description: "소상공인 풍수해보험",
      ariaLabel: "소상공인 풍수해보험 상품 페이지로 이동",
    },
    {
      id: "safetyHouse",
      category: "화재/풍수해",
      title: "주택 풍수해",
      href: "/safety/disasterHouse/",
      image: safetyHouseMainIcon,
      alt: "주택 풍수해보험",
      description: "주택 풍수해보험",
      ariaLabel: "주택 풍수해보험 상품 페이지로 이동",
    },
  ];

  // 필터에 따른 상품 필터링
  const filteredProducts = products.filter((product) => {
    if (activeFilter === "전체") return true;
    return product.category === activeFilter;
  });

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

  const handlePublicNavigation = (path) => {
    window.location.href = path; // 또는 navigate(path) 사용
  };

  const handleProtectedNavigation = (path) => {
    if (loggedIn) {
      window.location.href = path;
    } else {
      window.location.href = `/claim/login?redirect=${encodeURIComponent(
        path
      )}`;
    }
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  return (
    <>
      <MainHeader />

      {/* 메인 배너 추가 */}
      <section className={styles.mainBannerSection}>
        <div className={styles.mainBanner}>
          <img src={mainBannerImg} alt="메인 배너" className={styles.mainBannerImage} />
        </div>
      </section>

      <div className={styles.container}>
        {/* ✅ SEO 최적화: 크롤링 허용 영역 */}
        <main className={styles.section}>
          <ul className={styles.filterLists}>
            <li
              className={activeFilter === "전체" ? styles.active : ""}
              onClick={() => handleFilterClick("전체")}
            >
              전체
            </li>
            <li
              className={activeFilter === "여행" ? styles.active : ""}
              onClick={() => handleFilterClick("여행")}
            >
              여행
            </li>
            <li
              className={activeFilter === "가상자산" ? styles.active : ""}
              onClick={() => handleFilterClick("가상자산")}
            >
              가상자산
            </li>
            <li
              className={activeFilter === "화재/풍수해" ? styles.active : ""}
              onClick={() => handleFilterClick("화재/풍수해")}
            >
              화재/풍수해
            </li>
          </ul>
          <nav
            role="navigation"
            aria-label="주요 보험 상품"
            className={styles.categoryBox}
          >
            <ul>
              {filteredProducts.map((product) => (
                <li key={product.id}>
                  <a
                    href={product.href}
                    title={product.description}
                    aria-label={product.ariaLabel}
                  >
                    {(product.id === 'safetyGuard' || product.id === 'safetyHouse') && (
                      <div className={styles.newBadge}>New</div>
                    )}
                    <span>
                      {product.id === 'safetyGuard' ? (
                        <>소상공인<br />풍수해</>
                      ) : (
                        product.title
                      )}
                    </span>
                    <img src={product.image} alt={product.alt} />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </main>

        {/* ✅ SEO 최적화: 상품 링크 허용 */}
        <section className={styles.section}>
          <div className={styles.banner}>
            <div className={styles.imageWrap}>
              <a
                href="/trip/departed"
                title="출국 후에도 보험 가능한 가입"
                aria-label="출국 후 보험 상품 보러가기"
              >
                <img src="/images/banner1.png" alt="출국 후 보험 배너" />
              </a>
            </div>
            <div className={styles.imageWrap}>
              <a
                href="/trip/domestic"
                title="국내여행보험 저렴한 보험 가입"
                aria-label="국내여행보험 상품 보러가기"
              >
                <img src="/images/banner2.png" alt="국내여행보험 배너" />
              </a>
            </div>
          </div>
        </section>

        {/* ❌ SEO 차단: 고객 서비스 영역 */}
        <section className={styles.section} data-nosnippet>
          <div className={styles.serviceWrap}>
            <div className={styles.serviceContens}>
              <div className={styles.serviceTitle}>
                <img src={serviceSvg} alt="서비스 아이콘" />
                <p>내 보험서비스</p>
              </div>
              <span
                onClick={() => handleProtectedNavigation("/claimContractInfo")}
                style={{ cursor: "pointer" }}
                role="button"
                tabIndex={0}
                aria-label="계약조회 서비스 이용하기"
              >
                계약조회
              </span>
            </div>
            <hr />
            <ul>
              <li
                onClick={() => handleProtectedNavigation("/claimContractInfo")}
                style={{ cursor: "pointer" }}
                role="button"
                tabIndex={0}
                aria-label="가입증명서 발급받기"
              >
                가입증명서
              </li>
              <li
                onClick={() => handlePublicNavigation("/claimMembersIntro")}
                style={{ cursor: "pointer" }}
                role="button"
                tabIndex={0}
                aria-label="보험금 청구하기"
              >
                청구하기
              </li>
              <li
                onClick={() => handleProtectedNavigation("/claimConfirm")}
                style={{ cursor: "pointer" }}
                role="button"
                tabIndex={0}
                aria-label="청구 현황 확인하기"
              >
                청구확인
              </li>
            </ul>
          </div>
        </section>

        {/* ❌ SEO 차단: 기타 서비스 영역 */}
        <section className={styles.section} data-nosnippet>
          <div className={styles.claimMenu}>
            <ul>
              <li
                onClick={() => handleProtectedNavigation("/claimExtendDate")}
                role="button"
                tabIndex={0}
                aria-label="여행 도착일 변경 신청하기"
              >
                <div className={styles.claimMenuList}>
                  <img src={claimMenu1Svg} alt="여행 도착일 변경 아이콘" />
                  <p>여행 도착일 변경</p>
                </div>
                <img src={rightArrowSvg} alt="화살표" />
              </li>

              <li
                onClick={() => handleProtectedNavigation("/claimMembersIntro")}
                role="button"
                tabIndex={0}
                aria-label="청구 필요서류 확인하기"
              >
                <div className={styles.claimMenuList}>
                  <img src={claimMenu3Svg} alt="청구 필요서류 아이콘" />
                  <p>청구 필요서류</p>
                </div>
                <img src={rightArrowSvg} alt="화살표" />
              </li>
              <li
                onClick={() => handleProtectedNavigation("/claimRevocation")}
                role="button"
                tabIndex={0}
                aria-label="가입취소 신청하기"
              >
                <div className={styles.claimMenuList}>
                  <img src={claimMenu4Svg} alt="가입취소 아이콘" />
                  <p>가입취소</p>
                </div>
                <img src={rightArrowSvg} alt="화살표" />
              </li>
              <li onClick={() => handleProtectedNavigation("/claimReferral")}>
                <div className={styles.claimMenuList}>
                  <img src={claimMenu2Svg} alt="엽서 보내기" />
                  <p>엽서보내기</p>
                </div>
                <img src={rightArrowSvg} alt="화살표" />
              </li>
            </ul>
          </div>
        </section>

        <footer className={styles.footer}>
          <Footer />
        </footer>
      </div>
    </>
  );
}

export default Home;