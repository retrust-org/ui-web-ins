import React, { useState, useCallback, useEffect } from "react"; // useEffect 추가
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import styles from "../../../css/claim/claimMainSlick.module.css";

function MainSlick() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const tokenData = useSelector((state) => state.insurance?.insurances) || {};
  const data = Array.isArray(tokenData?.Insurances) ? tokenData.Insurances : [];
  const name = tokenData?.name || "";

  const handleSlideClick = useCallback(
    (id) => {
      if (isDragging) return;
      const selectedInsurance = data.find((item) => item.id === id);
      navigate(`/claimContractInfo/${id}`, {
        state: { selectedInsurance },
      });
    },
    [data, isDragging, navigate]
  );

  const handleLinkClick = (event) => {
    event.stopPropagation();
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const currentDate = formatDate(new Date());

  const filteredData = data.filter((item) => {
    const endDate = formatDate(new Date(item.Contract?.insurance_end_date));
    return endDate >= currentDate;
  });

  const sortedData = filteredData
    .slice()
    .sort((a, b) => {
      return (
        new Date(b.Contract?.insurance_start_date) -
        new Date(a.Contract?.insurance_start_date)
      );
    })
    .slice(0, 3);

  // 무한 슬라이드를 위한 데이터 생성 함수
  const createInfiniteData = useCallback(() => {
    const repeatCount = 100; // 충분히 큰 수로 설정
    return Array(repeatCount)
      .fill(null)
      .flatMap(() => sortedData);
  }, [sortedData]);

  const extendedData = createInfiniteData();

  // 슬라이드 순환을 위한 useEffect
  useEffect(() => {
    if (currentIndex > extendedData.length - sortedData.length) {
      setCurrentIndex(sortedData.length);
    } else if (currentIndex < 0) {
      setCurrentIndex(extendedData.length - sortedData.length * 2);
    }
  }, [currentIndex, extendedData.length, sortedData.length]);

  const getCurrentSlideNumber = useCallback(() => {
    const totalSlides = sortedData.length;
    if (totalSlides === 0) return 0;

    const actualIndex =
      ((currentIndex % totalSlides) + totalSlides) % totalSlides;
    return actualIndex + 1;
  }, [currentIndex, sortedData.length]);

  const handleTouchStart = (e) => {
    if (sortedData.length <= 1) return;
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (sortedData.length <= 1) return;
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (sortedData.length <= 1) return;
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(distance) < minSwipeDistance) return;

    if (distance > 0) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex((prev) => prev - 1);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleMouseDown = (e) => {
    if (sortedData.length <= 1) return;
    setIsDragging(true);
    setStartX(e.pageX - e.currentTarget.offsetLeft);
  };

  const handleMouseMove = (e) => {
    if (sortedData.length <= 1) return;
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - e.currentTarget.offsetLeft;
    const distance = startX - x;

    if (Math.abs(distance) > 50) {
      if (distance > 0) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setCurrentIndex((prev) => prev - 1);
      }
      setIsDragging(false);
    }
  };

  const handleMouseUp = () => {
    if (sortedData.length <= 1) return;
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    if (sortedData.length <= 1) return;
    setIsDragging(false);
  };

  const shouldShowSlider = sortedData.length > 0;

  return (
    <div className={styles.sliderContainer}>
      {shouldShowSlider ? <div className={styles.backgroundLayer} /> : null}
      <div className={styles.mainContent}>
        {shouldShowSlider ? (
          <>
            <div
              className={styles.sliderWrapper}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              <div
                className={styles.slideTrack}
                style={{
                  transform: `translateX(-${currentIndex * 100}%)`,
                  transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {extendedData.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    onClick={() => handleSlideClick(item.id)}
                    className={styles.slideItem}
                  >
                    <div className={styles.card}>
                      <div className={styles.cardHeader}>
                        <div className={styles.titleWrapper}>
                          <div className={styles.titleContent}>
                            <h3 className={styles.title}>
                              해외여행 실손의료보험
                            </h3>
                            <span className={styles.statusBadge}>정상</span>
                          </div>
                        </div>
                        <a
                          href={item.Card?.goKlip}
                          onClick={handleLinkClick}
                          className={styles.nftLink}
                        >
                          <span className={styles.nftText}>NFT 보러가기</span>
                          <svg
                            className={styles.nftIcon}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </a>
                      </div>
                      <ul className={styles.infoList}>
                        <li className={styles.infoItem}>
                          <span className={styles.infoLabel}>계약자</span>
                          <p className={styles.infoValue}>
                            {item.Contract?.User?.contractor_name}
                          </p>
                        </li>
                        <li className={styles.infoItem}>
                          <span className={styles.infoLabel}>피보험자</span>
                          <p className={styles.infoValue}>{name}</p>
                        </li>
                        <li className={styles.infoItem}>
                          <span className={styles.infoLabel}>보험기간</span>
                          <p className={styles.infoValue}>
                            {item.Contract?.insurance_start_date} ~{" "}
                            {item.Contract?.insurance_end_date}
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {sortedData.length > 0 && (
              <div className={styles.slideCounter}>
                {`${getCurrentSlideNumber()}/${sortedData.length}`}
              </div>
            )}
          </>
        ) : (
          <div className={styles.fallbackImageContainer}>
            <img
              src="/images/MainTopBanner.png"
              alt="메인 배너"
              className={styles.fallbackImage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default MainSlick;
