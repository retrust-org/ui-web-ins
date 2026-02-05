import React, { useState, useEffect, useCallback } from "react";
import ClaimHeader from "../../claim/components/ClaimHeader";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../../../css/claim/claimExtendSelectDate.module.css";
import { useSelector } from "react-redux";
import ExtendGoPay from "./ExtendGoPay";
import ErrorModal from "../../../components/modals/ErrorModal";
import Loading from "../../../components/loadings/Loading";
import ExtendBtn from "./ExtendBtn";

function ClaimExtendCostChk() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const errCd = searchParams.get("errCd");
  const errMsg = searchParams.get("errMsg");
  const user = useSelector((state) => state.cookie.cookie);
  const { state } = location;
  const [changeCost, setChangeCost] = useState(null);
  const [isModal, setIsModal] = useState(false);
  const [payData, setPayData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const startedDate = state?.startDate;
  const filteredData = state?.filteredData;
  const beforePrice = filteredData?.total_premium;
  const modifyEndDate = state?.modifyDate;
  const moid = filteredData?.moid;
  const product_cd = filteredData?.product_cd;
  const amount = changeCost?.amount;

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  };

  const ExtendEndDate = formatDate(modifyEndDate);

  useEffect(() => {
    if (!moid || !ExtendEndDate) return;

    const fetchAdditionalCost = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/trip-api/api/v1/trip/price/${moid}/extendable?product_cd=${product_cd}&end_date=${ExtendEndDate}`,
          {
            method: "GET",
            redirect: "follow",
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        setChangeCost(result);
      } catch (error) {
        console.error("에러:", error);
        setErrorMessage("추가 비용 조회 중 오류가 발생했습니다.");
        setIsModal(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdditionalCost();
  }, [ExtendEndDate, moid]);

  useEffect(() => {
    if (!changeCost || !moid) return;

    const fetchData = async () => {
      setIsLoading(true);
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify({
        product_cd,
        amount: changeCost?.amount,
        extendBgnDt: changeCost?.extendBgnDt,
        orderVO: changeCost?.orderVO,
        partner: changeCost?.partner,
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/v3/pay/order/${moid}/extendable`,
          requestOptions
        );
        const result = await response.json();

        if (result?.errCd !== "00001") {
          setErrorMessage(result?.errMsg);
          setIsModal(true);
        } else {
          setPayData(result);

          if (Number(changeCost.amount) === Number(beforePrice)) {
            setErrorMessage("결제 없이 변경 가능합니다.");
            setIsModal(true);
          }
        }
      } catch (error) {
        setErrorMessage("서버 통신 중 오류가 발생했습니다.");
        setIsModal(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [changeCost, moid, beforePrice]);

  useEffect(() => {
    if (errCd === "00001") {
      setErrorMessage("도착일 변경 완료했습니다.");
      setIsModal(true);
      // pushToDataLayer();
    } else if (errCd) {
      setErrorMessage(errMsg);
      setIsModal(true);
    }
  }, [errCd, errMsg]); //pushToDataLayer

  const closeModal = useCallback(() => {
    setIsModal(false);
    setErrorMessage("");
    if (Number(changeCost?.amount) !== Number(beforePrice)) {
      navigate("/claimExtendDate");
    }
  }, [changeCost, beforePrice, navigate]);

  return (
    <>
      <ClaimHeader titleText="여행기간 도착일 변경" />
      {isLoading && <Loading />}
      <div className={styles.container}>
        <div className={styles.containerWrap}>
          <div className={styles.contents}>
            <h3>추가보험료를 확인해주세요.</h3>
            <div className={styles.contentsBox}>
              <div className={styles.FlexCol}>
                <h4>{changeCost?.product_name}</h4>
                <div className={styles.boundary}></div>
                <ul>
                  <li>
                    <span>증권번호</span>
                    <p>{changeCost?.polNo}</p>
                  </li>
                  <li>
                    <span>계약자</span>
                    <p>{user.name}</p>
                  </li>
                  <li>
                    <span>피보험자</span>
                    <p>{user.name}</p>
                  </li>
                  <li>
                    <span>출발 일정일</span>
                    <p>{startedDate}</p>
                  </li>
                  <li>
                    <span>도착 일정일</span>
                    <p>{modifyEndDate}</p>
                  </li>
                  <li>
                    <span>변경 전 보험료</span>
                    <p>
                      {parseInt(
                        beforePrice?.replace(/[^0-9]/g, "") || "0"
                      ).toLocaleString()}
                      원
                    </p>
                  </li>
                  <li>
                    <div className={styles.afterPriceContents}>
                      <div className={styles.textTtitle}>변경 보험료</div>
                      <div className={styles.textCost}>
                        {amount !== null && !isNaN(amount)
                          ? parseInt(amount, 10).toLocaleString()
                          : 0}
                        원
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        {isModal}
        {isModal && <ErrorModal message={errorMessage} onClose={closeModal} />}
        {Number(amount) === Number(beforePrice) ? (
          <ExtendBtn payData={payData} changeCost={changeCost} />
        ) : (
          <ExtendGoPay payData={payData} changeCost={changeCost} />
        )}
      </div>
    </>
  );
}

export default ClaimExtendCostChk;
