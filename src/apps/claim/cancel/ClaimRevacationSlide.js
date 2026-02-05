import React, { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import styles from "../../../css/claim/ClaimRevacationSlide.module.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { formatDate } from "../../../utils/currentDate";
import ErrorModal from "../../../components/modals/ErrorModal";

function ClaimRevocationSlide({ tokenData, setFilterData }) {
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const slideClick = (id, deletable) => {
    if (!deletable) {
      setShowErrorModal(true);
      return;
    }
    navigate(`/claimRevocation/${id}`);
  };

  const data = Array.isArray(tokenData.Insurances) ? tokenData.Insurances : [];
  const name = tokenData.name || "";

  const settings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: false,
    infinite: false,
    arrows: false,
    centerMode: true,
    centerPadding: "30px",
  };

  const formatNumberWithCommas = (numberString) => {
    if (!numberString) return "0";
    const number = parseInt(numberString);
    return number.toLocaleString();
  };

  const currentDate = formatDate(new Date());

  // 데이터를 필터링하여 만료된 보험과 현재 날짜에 개시된 보험을 제외합니다.
  const filteredData = data.filter((item) => {
    const endDate = formatDate(new Date(item.Contract?.insurance_end_date));
    const startDate = formatDate(new Date(item.Contract?.insurance_start_date));

    // 만료일이 현재보다 이후이고 시작일이 오늘이 아닌 경우만 표시
    return endDate > currentDate && startDate !== currentDate;
  });

  const sortedData = filteredData.slice().sort((a, b) => {
    return (
      new Date(b.Contract?.insurance_start_date) -
      new Date(a.Contract?.insurance_start_date)
    );
  });

  useEffect(() => {
    setFilterData(filteredData);
  }, [filteredData]);

  // 일반 에러 모달 닫기
  const errorModalClose = () => {
    setShowErrorModal(false);
  };

  return (
    <div className={styles.sliderContainer}>
      {sortedData.length > 0 && (
        <Slider
          ref={sliderRef}
          {...settings}
          style={{
            marginBottom: "20px",
            bottom: "0px",
            right: "10px",
          }}
        >
          {sortedData.slice(0, 4).map((item) => (
            <div
              key={item.id}
              onClick={() => slideClick(item?.Contract?.id, item.deletable)}
            >
              <div className={styles.slideContents}>
                <h3>{item?.Contract?.Product?.product_nm}</h3>
                <div className={styles.boundaryWrap}>
                  <div className={styles.boundary}></div>
                </div>
                <div className={styles.userInfoConents}>
                  <ul>
                    <li>
                      <span>견적번호</span>
                      <p>{item.Contract?.group_no}</p>
                    </li>
                    <li>
                      <span>보험기간</span>
                      <p>
                        {item.Contract?.insurance_start_date} ~{" "}
                        {item.Contract?.insurance_end_date}
                      </p>
                    </li>
                    <li>
                      <span>계약자</span>
                      <p>{item.Contract?.User?.contractor_name}</p>
                    </li>
                    <li>
                      <span>피보험자</span>
                      <p>{name}</p>
                    </li>
                    <li>
                      <span>환급보험료</span>
                      <p>
                        {" "}
                        {`${formatNumberWithCommas(
                          item.Contract?.total_premium
                        )}원`}
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      )}

      {/* 동반가입자 취소 불가 에러 모달 */}
      {showErrorModal && (
        <ErrorModal
          onClose={errorModalClose}
          message="동반가입자 취소 불가능"
          subMsg="단체 보험상품으로 동반가입자 보험이 일괄 취소되므로, 가입하신 계약자만 취소가 가능합니다."
        />
      )}
    </div>
  );
}

export default ClaimRevocationSlide;
