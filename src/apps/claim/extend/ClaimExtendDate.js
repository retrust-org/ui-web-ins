import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../../css/claim/claimExtendDate.module.css";
import Loading from "../../../components/loadings/Loading";
import ClaimSubHeaders from "../components/ClaimSubHeaders";
import DownArrow from "../../../assets/commonDownArrow.svg";
import cityData from "../../../data/CityinfoData.json";
import ErrorModal from "../../../components/modals/ErrorModal";

function ClaimExtendDate() {
  const [extendData, setExtendData] = useState([]);
  const [activeBtns, setActiveBtns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState({
    isError: false,
    message: "",
  });

  const navigate = useNavigate();

  const filterCountry = (countryCd) => {
    const country = cityData.find((e) => e.cityNatlCd === countryCd);

    if (!country) {
      return "국내 전역";
    }

    return country.korNatlNm || country.korCityNm || "국내 전역";
  };

  const sortedData = extendData.slice().sort((a, b) => {
    const dateA = new Date(a.insurance_start_date);
    const dateB = new Date(b.insurance_start_date);
    return dateA - dateB;
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/trip-api/api/v1/trip/contracts/extendable`
        );

        if (!response.ok) {
          throw new Error("서버 응답에 실패했습니다.");
        }

        const result = await response.json();

        if (result.success === false) {
          throw new Error(result.message || "데이터 조회에 실패했습니다.");
        }

        if (!result.data || result.data.length === 0) {
          setError({
            isError: true,
            message: "해당 데이터가 없습니다.",
          });
          return;
        }

        setExtendData(result.data);
      } catch (error) {
        console.error("데이터 조회 실패:", error);
        setError({
          isError: true,
          message: error.message || "데이터 조회 중 오류가 발생했습니다.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCloseModal = () => {
    setError({
      isError: false,
      message: "",
    });
    window.location.href = "/";
  };

  const toggleActive = (index, moid) => {
    setActiveBtns((prev) => {
      const newActiveBtns = [...prev];
      newActiveBtns[index] = !newActiveBtns[index];
      return newActiveBtns;
    });
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      navigate(`/claimExtendDate/${moid}`, { state: extendData });
    }, 1000);
  };

  const handleToggleShow = () => setShowAll((prev) => !prev);

  if (loading) return <Loading />;

  if (error.isError) {
    return (
      <ErrorModal
        isOpen={error.isError}
        onClose={handleCloseModal}
        message={error.message}
      />
    );
  }

  return (
    <>
      <ClaimSubHeaders titleText="여행기간 도착일 변경" />
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.title}>
            <h3>도착일을 연장할 계약을 선택해주세요.</h3>
            <span>*출국 당일날에는 도착일 변경이 되지않습니다.</span>
          </div>
          <div className={styles.contentWrap}>
            {sortedData
              .slice(0, showAll ? extendData.length : 3)
              .map((e, i) => (
                <div
                  key={i}
                  className={styles.contentsList}
                  onClick={() => toggleActive(i, e.moid)}
                >
                  <div className={styles.contentsListTitle}>
                    <h3>{e.product_name}</h3>
                    <div className={styles.toggleSwitch}>
                      <div
                        className={`${styles.toggleBtnWrap} ${
                          activeBtns[i] ? styles.active : ""
                        }`}
                      >
                        <div className={styles.imageWrap}>
                          <div className={styles.imageBg}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.boundary}></div>
                  <ul>
                    <li>
                      <p>출발일:</p>
                      <p>{e.insurance_start_date}</p>
                      <p>도착일:</p>
                      <p>{e.insurance_end_date}</p>
                    </li>
                    <li>
                      <p>여행지:</p>
                      <p>{filterCountry(e.trip_country)}</p>
                    </li>
                    <li>
                      <p>증권번호</p>
                      <p>{e.policy_no}</p>
                    </li>
                  </ul>
                </div>
              ))}
          </div>
          {extendData.length > 3 && (
            <div className={styles.showMore} onClick={handleToggleShow}>
              <p>{showAll ? "접기" : "펼쳐보기"}</p>
              <img
                src={DownArrow}
                alt=""
                className={showAll ? styles.imgActive : ""}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ClaimExtendDate;
