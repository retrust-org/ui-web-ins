import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import Button from "../../../../components/buttons/Button";
import Header from "../../../../components/headers/Header";
import Loading from "../../../../components/loadings/Loading";
import { setSelectedCountryData, clearCountryData } from "../../../../redux/store";
import styles from "../../../../css/trip/tripSelect.module.css";
import CityinfoData from "../../../../data/CityinfoData.json";
import commonSearch from "../../../../assets/commonSearch.svg";
import SearchModal from "../../../../components/modals/SearchModal";
import Recommend from './Recommend'

// getImageUrl 함수 정의
const getImageUrl = async (countryCode) => {
  const imageUrl = `/nationImages/${countryCode}_92.png`;
  try {
    const response = await fetch(imageUrl);
    if (response.ok) {
      return imageUrl;
    } else {
      throw new Error("Image not found");
    }
  } catch (error) {
    return "/nationImages/NC01_92.png";
  }
};

function TripSelect() {
  const [countryDataes, setCountryDataes] = useState([]);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryImageUrl, setCountryImageUrl] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const storeSelectedCountry = (country) => {
    sessionStorage.setItem("selectedCountry", JSON.stringify(country));
  };

  useEffect(() => {
    const handleScroll = () => {
      const headerHeight = 10;
      setIsHeaderSticky(window.scrollY >= headerHeight);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const getData = async () => {
      try {
        setCountryDataes(CityinfoData);
      } catch (error) {
        console.error("에러 메세지:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    const storedCountry = sessionStorage.getItem("selectedCountry");
    if (storedCountry) {
      setSelectedCountry(JSON.parse(storedCountry));
    }
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const fetchImageUrl = async () => {
        const url = await getImageUrl(selectedCountry.cityNatlCd);
        setCountryImageUrl(url);
      };
      fetchImageUrl();
    }
  }, [selectedCountry]);

  const NextButton = () => {
    if (!selectedCountry) {
      alert("선택한 나라가 없습니다!");
    } else {
      dispatch(setSelectedCountryData(selectedCountry));
    }
    navigate("/purpose");
  };

  const handleSelectCountry = (selectedData) => {
    dispatch(clearCountryData());
    setSelectedCountry(selectedData);
    storeSelectedCountry(selectedData);
    setIsModalOpen(false);
  };

  const getSelectedCountryData = () => {
    if (!selectedCountry) return null;
    return countryDataes.find(
      (country) => country.cityNatlCd === selectedCountry.cityNatlCd
    );
  };

  const selectedCountryData = getSelectedCountryData();
  const defaultImageUrl = "/nationImages/NC01_92.png";

  return (
    <>
      <section className={styles.TripSection}>
        <Header TitleText={false} isSticky={isHeaderSticky} />
        {isLoading && <Loading />}
        <div>
          <p className={styles.title}>
            어떤 곳으로{" "}
            <span style={{ color: "#386937" }}>
              여행
            </span>
            을 하실 계획
            <br /> 이신가요?
          </p>
          <div
            className={`${styles.stickycontainer} ${isHeaderSticky ? styles.stickyHeader : ""
              }`}
          >
            <div className={styles.tripSelectBox}>
              <p className={styles.tripNation}>여행국가</p>
              <p className={styles.multiTripGuide}>
                ※ 여러 국가를 경유하실 경우,{" "}
                <span className={styles.emphasis}>경유지</span> 중 하나만 선택해
                주세요.
              </p>
              <div
                className={styles.inputSearchboxWrap}
                onClick={() => setIsModalOpen(true)}
              >
                <input
                  type="text"
                  className={styles.inputSearchBox}
                  placeholder="여행 국가 선택"
                  readOnly
                />
                <img
                  src={commonSearch}
                  alt="search icon"
                  className={styles.SearchIcon}
                />
              </div>
            </div>
          </div>
          {selectedCountry && selectedCountryData && (
            <div className={styles.selectedCountryWrap}>
              <div
                className={styles.selectedContents}
              >
                <div className={styles.selectedContentsWrap}>
                  <div
                    className={styles.selectedImageWrap}
                    style={{
                      backgroundImage: `url(${countryImageUrl}), url(${defaultImageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  ></div>

                  <div className={styles.selectedContentsInfo}>
                    <div className={styles.selectedTitle}>
                      <div className={styles.ImageWrapper}>
                        <img
                          src={
                            selectedCountryData.imageUrl
                              ? selectedCountryData.imageUrl
                              : "/nationImages/defalutImage.png"
                          }
                          alt="이미지"
                          className={styles.fetchImages}
                        />
                      </div>
                      {selectedCountryData.korNatlNm}
                    </div>
                    <div className={styles.selectedData}>
                      <div className={styles.selectedDataItem}>
                        <span className={styles.dataLabel}>
                          수도: {selectedCountryData.capitalCity}
                        </span>
                      </div>
                      <div className={styles.selectedDataItem}>
                        <span className={styles.dataLabel}>
                          대륙: {selectedCountryData.continent}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <Recommend />
          <Button
            onClick={NextButton}
            disabled={!selectedCountry}
            buttonText="다음"
          />
        </div>
        {isModalOpen && (
          <SearchModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSelectCountry={handleSelectCountry}
          />
        )}
      </section>
    </>
  );
}

export default TripSelect;
