import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../../css/trip/tripSelect.module.css";
import recommandFire from "../../../assets/recommandFire.svg";
import CityinfoData from "../../../data/CityinfoData.json";
import { useDispatch } from "react-redux";
import { setRecommendedCountryData, clearCountryData } from "../../../redux/store";
import Loading from "../../../components/loadings/Loading"; // Loading 컴포넌트 import

// 데이터 가져오기
const fetchData = async () => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return CityinfoData;
  } catch (error) {
    console.error("데이터를 불러오는 중 오류 발생", error);
    return null;
  }
};

// 추천 국가 필터링 arr의 경우 데이터 array를 뜻함.
const filterRecommendedCountries = (data) => {
  const recommendedCountries = ["일본", "싱가폴", "베트남"];
  const filteredData = data.filter(
    (country, index, arr) =>
      index ===
      arr.findIndex(
        (t) =>
          t.korNatlNm === country.korNatlNm &&
          recommendedCountries.includes(country.korNatlNm)
      )
  );
  return filteredData;
};

function Recommend() {
  const [countryData, setCountryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const NationArray = ["country2.png", "country3.png", "country1.png"];

  // 데이터 로딩 useEffect
  useEffect(() => {
    const fetchAndSetCountryData = async () => {
      try {
        const data = await fetchData();
        if (data) {
          const filteredData = filterRecommendedCountries(data);
          setCountryData(filteredData);
        }
      } catch (error) {
        console.error("데이터 처리 중 오류 발생", error);
        // 필요에 따라 오류 처리 로직 추가 가능
      } finally {
        setIsLoading(false); // 데이터 로딩이 완료되면 로딩 상태를 false로 설정
      }
    };

    fetchAndSetCountryData();
  }, []);

  // 클릭 핸들러
  const handleClick = (country) => {
    if (isLoading) {
      // 데이터 로딩 중일 때는 클릭 이벤트 무시
      return;
    }
    dispatch(clearCountryData()); // 선택된 국가 데이터를 초기화
    dispatch(setRecommendedCountryData(country));
    navigate("/indemnity");
  };

  // JSX 반환
  return (
    <div className={styles.RecommandSection}>
      <span className={styles.RecommandSection_title}>오늘의 추천 여행지</span>
      {isLoading ? (
        <Loading /> // 로딩 중일 때 Loading 컴포넌트 표시
      ) : (
        <ul className={styles.RecommandSectionContents}>
          {countryData.slice(0, 3).map((country, index) => (
            <RecommendedCountryItem
              key={index}
              country={country}
              index={index}
              NationArray={NationArray}
              onClick={handleClick}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

// 추천 국가 아이템 컴포넌트
const RecommendedCountryItem = ({ country, index, NationArray, onClick }) => {
  return (
    <li
      className={styles.RecommandSectionContents_List}
      onClick={() => onClick(country)}
      style={{ backgroundImage: `url('/images/${NationArray[index]}')` }}
    >
      <div className={styles.followUp_NationWrap}>
        <div className={styles.followUp_Nation}>
          <img src={recommandFire} alt="recommandFire" />
          <p className={styles.followUp_Nation_text}>인기 급상승 국가</p>
        </div>
      </div>
      <div className={styles.countryFlexRow}>
        <div className={styles.ImageWrap}>
          <img
            src={country.imageUrl}
            alt={country.korNatlNm}
            className={styles.countryImage}
          />
        </div>
        <p className={styles.countryCommon}>{country.korNatlNm}</p>
      </div>
      <div className={styles.recommandInfoWrap}>
        <span className={styles.recommandInfo}>추천국가 기본 정보</span>
        <p className={styles.capital}>수도: {country.capitalCity}</p>
        <p className={styles.population}>대륙: {country.continent}</p>
      </div>
    </li>
  );
};

export default Recommend;
