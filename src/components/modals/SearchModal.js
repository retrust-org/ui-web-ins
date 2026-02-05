import React, { useState, useEffect, useRef, useCallback } from "react";
import Loading from "../../components/loadings/Loading";
import ErrorModal from "../../components/modals/ErrorModal";
import { InputDeleteSVG } from "../svgIcons/RestFinishSVG";
import commonSearch from "../../assets/commonSearch.svg";
import commonX from "../../assets/commonX.svg";
import CityinfoData from "../../data/CityinfoData.json";
import styles from "../../css/common/searchModal.module.css";
import modalLayOut from "../../css/common/modalLayOut.module.css";
import { handleSearchResultsNavigation, handleEscapeKey } from "../../utils/keyboardNavigation";

function SearchModal({ isOpen, onClose, onSelectCountry }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [error, setError] = useState(null);
  const searchInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const resultsContainerRef = useRef(null);
  const appType = process.env.REACT_APP_TYPE || "";
  const isDepartedApp = appType === "DEPARTED";

  const handleOverlayClick = (e) => {
    // 오버레이 클릭 핸들러 추가
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    setIsActive(true);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // 키보드 네비게이션 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (e) => {
      // ESC 키로 모달 닫기
      if (handleEscapeKey(e, onClose)) {
        return;
      }

      // 검색 결과 네비게이션
      if (searchResults.length > 0) {
        const handled = handleSearchResultsNavigation(
          e,
          searchResults,
          highlightedIndex,
          setHighlightedIndex,
          (result) => handleSearch(result)
        );

        if (handled) {
          return;
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, searchResults, highlightedIndex, onClose]);

  // 검색 결과가 변경될 때 하이라이트 초기화
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchResults]);

  useEffect(() => {
    if (selectedData) {
      onSelectCountry(selectedData);
      onClose(); // 선택 후 모달 닫기
    }
  }, [selectedData, onSelectCountry, onClose]);

  const fetchCountries = () => {
    if (Array.isArray(CityinfoData)) {
      const countrySet = new Set(
        CityinfoData.map((data) => data.korNatlNm).filter(Boolean)
      );
      const citySet = new Set(
        CityinfoData.map((data) => data.korCityNm).filter(Boolean)
      );
      const sortedCountries = Array.from(countrySet).sort((a, b) =>
        a.localeCompare(b, "ko-KR")
      );
      const sortedCities = Array.from(citySet).sort((a, b) =>
        a.localeCompare(b, "ko-KR")
      );
      const combinedResults = [...sortedCountries, ...sortedCities];
      setAllResults(combinedResults);
      setSearchResults(combinedResults);
    } else {
      console.error("데이터가 배열 형태가 아닙니다:");
    }
  };

  const handleErrorConfirm = () => {
    setError(null);
    setSearchTerm(""); // 검색어 초기화
    setSearchResults(allResults); // 검색 결과 초기화
    setIsActive(true); // 활성 상태로 변경
  };

  const handleInputClick = useCallback((event) => {
    console.log('SearchModal: 검색 입력창 클릭 - 검색어 초기화');
    event.preventDefault();
    event.stopPropagation();
    setIsActive(true);
    setSearchTerm("");
    setSearchResults(allResults); // 검색 결과도 전체 목록으로 초기화
    setHighlightedIndex(-1); // 하이라이트 인덱스 초기화

    // 입력창에 포커스 설정
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [allResults]);

  // 검색 입력창 포커스 핸들러
  const handleInputFocus = useCallback(() => {
    console.log('SearchModal: 검색 입력창 포커스');
    setIsActive(true);
  }, []);

  const handleInputChange = useCallback(
    (event) => {
      const searchValue = event.target.value;
      setSearchTerm(searchValue);
      if (searchValue === "") {
        setSearchResults(allResults);
      } else {
        const filteredResults = allResults.filter((result) =>
          result.toLowerCase().includes(searchValue.toLowerCase())
        );
        setSearchResults(filteredResults);
      }
    },
    [allResults]
  );

  const serverData = useCallback(
    async (searchValue) => {
      setIsLoading(true);

      try {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: JSON.stringify({ searchValue }),
          redirect: "follow",
        };

        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/trip-api/searchNatlCd`,
          requestOptions
        );

        if (response.ok) {
          const data = await response.json();
          setIsActive(false);
          if (
            data.opapiTrvCityNatlInfCbcVo &&
            data.opapiTrvCityNatlInfCbcVo.length > 0
          ) {
            const trvRskGrdeCd = data.opapiTrvCityNatlInfCbcVo[0].trvRskGrdeCd;
            if (trvRskGrdeCd.trim() === "XX") {
              setError("해당 국가는 여행이 제한된 국가입니다.");
              setSearchTerm(""); // 검색어 초기화
              setSearchResults(allResults); // 검색 결과 초기화
              setIsActive(true); // 활성 상태로 변경
            } else {
              setSelectedData(data.opapiTrvCityNatlInfCbcVo[0]);
            }
          } else {
            console.error("서버 응답 오류: 데이터 형식이 잘못되었습니다.");
          }
        } else {
          console.error("서버 응답 오류:", response.status);
        }
      } catch (error) {
        console.error("데이터를 불러오는 중 오류가 발생했습니다:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [allResults]
  );

  const handleSearch = useCallback(
    (searchValue) => {
      const selectedData = CityinfoData.find(
        (data) =>
          data.korNatlNm === searchValue || data.korCityNm === searchValue
      );
      if (selectedData) {
        serverData(selectedData.cityNatlCd);
      } else {
        setError("검색 결과가 없습니다.");
      }
    },
    [serverData]
  );

  // 검색 결과 클릭 핸들러 (명시적 이벤트 처리)
  const handleResultClick = useCallback((result, event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('SearchModal: 검색 결과 클릭:', result);
    handleSearch(result);
  }, [handleSearch]);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div
          className={`${modalLayOut.modalOverlay} ${
            isOpen
              ? modalLayOut.modalOverlay_enter_active
              : modalLayOut.modalOverlay_exit_active
          }`}
          onMouseDown={handleOverlayClick} // 이벤트 핸들러 추가
        >
          <div
            className={`${modalLayOut.modal_bottom} ${styles.modal_container} ${
              isOpen
                ? modalLayOut.modal_bottom_enter_active
                : modalLayOut.modal_bottom_exit_active
            }`} // 애니메이션 클래스 추가
          >
            <div className={styles.header_container}>
              <p className={styles.title}>여행 국가 선택</p>
              <img
                src={commonX}
                alt="Close"
                onClick={onClose}
                className={styles.close_button}
              />
            </div>
            <div
              className={styles.search_container}
              onClick={handleInputClick}
            >
              <input
                ref={searchInputRef}
                className={styles.search_input}
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onClick={handleInputClick}
                onFocus={handleInputFocus}
                placeholder="여행지를 검색해주세요"
                style={{ cursor: 'text', pointerEvents: 'auto' }}
              />
              {searchTerm && searchTerm.length > 0 && (
                <div
                  className={styles.delete_button}
                  onClick={() => setSearchTerm("")}
                  style={{
                    zIndex: 15,
                    pointerEvents: 'auto',
                    cursor: 'pointer',
                    display: 'flex'
                  }}
                >
                  <InputDeleteSVG />
                </div>
              )}
              <div
                className={styles.search_icon_container}
                style={{ zIndex: 15, pointerEvents: 'auto' }}
              >
                <img
                  src={commonSearch}
                  className={styles.search_icon}
                  alt="Search"
                  onClick={() => handleSearch(searchTerm)}
                  style={{
                    zIndex: 15,
                    pointerEvents: 'auto',
                    display: 'block',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>
            <div className={styles.results_container} ref={resultsContainerRef}>
              <ul role="listbox" aria-label="국가 검색 결과">
                {searchResults.map((result, index) => (
                  <li
                    key={index}
                    className={`${styles.result_item} ${
                      index === highlightedIndex ? styles.highlighted : ''
                    }`}
                    onClick={(e) => handleResultClick(result, e)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onMouseLeave={() => setHighlightedIndex(-1)}
                    tabIndex={0}
                    role="option"
                    {...(index === highlightedIndex && { 'aria-selected': 'true' })}
                    style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                  >
                    {result}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      {error && <ErrorModal message={error} onClose={handleErrorConfirm} />}
    </>
  );
}

export default SearchModal;