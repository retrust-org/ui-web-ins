import React, { useState, useEffect } from "react";
import Footer from "../../components/footer/Footer";
import styles from "../../css/partner/main.module.css";
import { usePartner } from "../../hooks/usePartner";
import MainHeader from "../../components/headers/MainHeader";
import Loading from '../../components/loadings/Loading'
import overseasSvg from "../../assets/overseas.svg";
import departedSvg from "../../assets/departed.svg";
import longtermSvg from "../../assets/longterm.svg";
import domesticSvg from "../../assets/domestic.svg";

// 추가된 SVG import
import serviceSvg from "../../assets/service.svg";
import claimMenu1Svg from "../../assets/claimMenu1.svg";
import claimMenu2Svg from "../../assets/claimMenu2.svg";
import claimMenu3Svg from "../../assets/claimMenu3.svg";
import claimMenu4Svg from "../../assets/claimMenu4.svg";
import rightArrowSvg from "../../assets/rightArrow.svg";
import { useLocation } from "react-router-dom";
import mainBannerImg from "../../assets/mainBanner.png";

function PartnerMain() {
  const location = useLocation();
  const partnerData = usePartner();
  const { isB2B, partnerId, partnerConfig, isLoading, error } = partnerData;
  const [loggedIn, setLoggedIn] = useState(false);

  // 로그인 상태 체크
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

  const isCover1b2b = () => {
    return partnerConfig?.partner_cd === "cover1b2b";
  }

  // 보호된 네비게이션 처리 함수 (Home 컴포넌트와 동일한 로직)
  const handleProtectedNavigation = (path) => {
    if (loggedIn) {
      // 로그인된 경우 바로 이동
      window.location.href = `${window.location.origin}${window.basename}/claim${path}`;
    } else {
      // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
      window.location.href = `${window.location.origin}${window.basename}/claim/login?redirect=${encodeURIComponent(`${path}`)}`;
    }
  };

  // 로딩 중일 때
  if (isLoading) {
    return <Loading />;
  }

  // 명시적인 에러가 있을 때만 에러 표시
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>파트너 정보를 불러올 수 없습니다.</h2>
        <p>{error.message || "잠시 후 다시 시도해 주세요."}</p>
      </div>
    );
  }

  // 로딩도 끝나고 에러도 없는데 데이터가 없다면 기본 화면 표시
  if (!isB2B || !partnerConfig) {
    return <Loading />; // 계속 로딩 표시하거나
    // 또는 기본 화면 표시
  }

  // 서비스 타입별 이미지와 텍스트 매핑
  const serviceMap = {
    overseas: { text: "해외여행", image: overseasSvg },
    departed: { text: "출국후", image: departedSvg },
    longterm: { text: "장기체류", image: longtermSvg },
    domestic: { text: "국내여행", image: domesticSvg },
  };

  // partnerService에서 serviceMap에 있는 서비스만 필터링 (main, claim 제외)
  const availableServices = partnerConfig?.partnerService?.filter(
    (service) => serviceMap.hasOwnProperty(service)
  ) || [];

  // 실제 표시 가능한 서비스 개수
  const displayableServiceCount = availableServices.length;

  return (
    <div className={styles.mainContainer}>
      <MainHeader MainHeadertitle="파트너내용" />
      {displayableServiceCount > 2 ? (
        <>
          <div className={styles.container}>
            <div className={styles.section}>
              <img src={mainBannerImg} alt="mainBannerImg" className={styles.mainBannerImg} />
              <h1>인슈어트러스트 보험상품</h1>
              <div className={styles.categoryBox}>
                <ul>
                  {availableServices.map((service) => (
                    <li key={service}>
                      <a href={`/${partnerId}/${service}`}>
                        <span>{serviceMap[service].text}</span>
                        <img
                          src={serviceMap[service].image}
                          alt={serviceMap[service].text}
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : (
        // 2개 이하일 때: 배너 형태로 표시
        <div className={isCover1b2b() ? styles.coverSectionTop : styles.sectionTop}>
          <div className={styles.sectionTopBanner}>
            <div className={styles.topBannerImage}>
              {isCover1b2b() ? (
                <div className={styles.coverBannerWrap}>
                  <img src="/images/Cover1MainTopBanner.png" alt="메인 배너" />
                </div>
              ) : (
                <div className={styles.mainBannerImgWrap}>
                  <img src={mainBannerImg} alt="메인 배너" />
                </div>
              )}
            </div>
            <div className={styles.signUpContainer}>
              <div className={styles.signUpContents}>
                {/* 첫 번째 서비스가 있으면 표시 */}
                {availableServices[0] && (
                  <a
                    className={styles.signUpcontentsBox}
                    href={`/${partnerId}/${availableServices[0]}`}
                  >
                    <div className={styles.signUpcontentsBoxTitle}>
                      <div className={styles.boxTitle}>
                        <p>
                          {serviceMap[availableServices[0]].text}
                          <br />
                          보험 가입
                        </p>
                      </div>
                      <div className={styles.signUpSpot}>
                        <span>베스트</span>
                      </div>
                    </div>
                    <p className={styles.signUpcontentsDesc}>
                      AI가 맞춤형으로 분석
                      <br />
                      알뜰플랜부터 고급플랜까지
                    </p>
                  </a>
                )}

                {/* 두 번째 서비스가 있으면 표시 */}
                {availableServices[1] && (
                  <a
                    className={styles.signUpcontentsBox}
                    href={`/${partnerId}/${availableServices[1]}`}
                  >
                    <div className={styles.signUpcontentsBoxTitle}>
                      <div className={styles.boxTitle}>
                        <p>
                          {serviceMap[availableServices[1]].text}
                          <br />
                          보험 가입
                        </p>
                      </div>
                      <div className={styles.signUpSpot}>
                        <span>인기 급상승</span>
                      </div>
                    </div>
                    <p className={styles.signUpcontentsDesc}>
                      {availableServices[1] === 'departed'
                        ? '이미 여행 중이신가요?\n지금 안심하고 가입하세요'
                        : '안전하고 편리한\n보험 서비스를 제공합니다'
                      }
                    </p>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.serviceContainer}>
        {/* 내 보험서비스 섹션 */}
        <section className={styles.sectionService} data-nosnippet>
          <div className={styles.partnerServiceWrap}>
            <div className={styles.partnerServiceContents}>
              <div className={styles.partnerServiceTitle}>
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
            <hr className={styles.partnerServiceHr} />
            <ul className={styles.partnerServiceList}>
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
                onClick={() => handleProtectedNavigation("/claimMembersIntro")}
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

        {/* 기타 서비스 섹션 */}
        <section className={styles.sectionService} data-nosnippet>
          <div className={styles.partnerClaimMenu}>
            <ul>
              <li
                onClick={() => handleProtectedNavigation("/claimExtendDate")}
                role="button"
                tabIndex={0}
                aria-label="여행 도착일 변경 신청하기"
              >
                <div className={styles.partnerClaimMenuList}>
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
                <div className={styles.partnerClaimMenuList}>
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
                <div className={styles.partnerClaimMenuList}>
                  <img src={claimMenu4Svg} alt="가입취소 아이콘" />
                  <p>가입취소</p>
                </div>
                <img src={rightArrowSvg} alt="화살표" />
              </li>
              <li
                onClick={() => handleProtectedNavigation("/claimReferral")}
                role="button"
                tabIndex={0}
                aria-label="가입취소 신청하기"
              >
                <div className={styles.partnerClaimMenuList}>
                  <img src={claimMenu2Svg} alt="엽서 보내기" />
                  <p>엽서보내기</p>
                </div>
                <img src={rightArrowSvg} alt="화살표" />
              </li>
            </ul>
          </div>
        </section>
      </div>

      <div className={styles.footerWrapper}>
        <Footer />
      </div>
    </div>
  );
}

export default PartnerMain;