import React, { useEffect, useState } from "react";
import ClaimHeader from "../components/ClaimHeader";
import styles from "../../../css/claim/claimPaymentStatement.module.css";
import confirmPDF_1 from "../../../assets/confirmPDF_1.svg";
import PaymentStatementTable from "./PaymentStatementTable";

import { useLocation, useParams } from "react-router-dom";

function PaymentStatement() {
  const [data, setData] = useState({}); // State to hold the fetched data
  const { clmId } = useParams();
  //암호화된 데이터 전달
  const location = useLocation();
  const encryptIdNum = location.state?.encryptIdNum;

  useEffect(() => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: encryptIdNum,
      redirect: "follow",
    };

    fetch(
      `${process.env.REACT_APP_BASE_URL}/trip-api/claim/${clmId}/payment`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        alert("성공");
        setData(result);
      })
      .catch((error) => console.error(error));
  }, []);

  const acdNo =
    data.hmpgCladjPayDstmRpdcBasMttBcVo?.[0]?.acdNo || "데이터 없음";
  const inspeNm =
    data.hmpgCladjPayDstmRpdcBasMttBcVo?.[0]?.inspeNm || "데이터 없음";
  const ctp = data.hmpgCladjPayDstmRpdcBasMttBcVo?.[0]?.ctp || "데이터 없음";
  const chrpe =
    data.hmpgCladjPayDstmRpdcBasMttBcVo?.[0]?.chrpe || "데이터 없음";

  return (
    <>
      <ClaimHeader titleText="지급내역서 발급" />
      <div className={styles.paymentStatementContents}>
        <div className={styles.paymentStatementContentsWrap}>
          <div className={styles.paymentStatementWrap}>
            <div className={styles.userInfoCoentsWrap}>
              <div className={styles.userInfoCoents}>
                <ul>
                  <li>
                    <p>사고번호</p>
                    <span>{acdNo}</span>
                  </li>
                  <li>
                    <p>담당자</p>
                    <span>{chrpe}</span>
                  </li>
                  <li>
                    <p>연락처</p>
                    <span>{ctp}</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className={styles.userReception}>
              <ul className="">
                <li>수신 :</li>
                <li>{inspeNm}</li>
                <li>귀하</li>
              </ul>
            </div>
            <div className={styles.boundaryWrap}>
              <div className={styles.boundary}></div>
            </div>
            <div className={styles.explainWrap}>
              <p>
                귀하께서 당사에 청구하신 보험금과 관련하여 아래와 같이 지급내역
                등을 설명하여 드리오니 참조하시기 바랍니다. 보다 자세한 사항은
                당사 담당자 또는 당사 홈페이지를 통하여 확인 가능합니다.
              </p>
              <div className={styles.explainPDF_Wrap}>
                <div className={styles.explainPDF}>
                  <p>보험금 지급 설명서(PDF)</p>
                  <img src={confirmPDF_1} alt="confirmPDF_1" />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.boundaryLineWrap}>
            <div className={styles.boundaryLine}></div>
          </div>
          <PaymentStatementTable data={data} />
        </div>
        <div className={styles.contentsAnnounce}>
          <div className={styles.contentsAnnounceWrap}>
            <div className={styles.announceEtc}>
              <span>•기타사항</span>
              <p>기타 정보 입력, 없을 경우 공백, 해당 크기 유지</p>
            </div>
            <div className={styles.announceConsumer}>
              <span>•추가청구 및 소비자보호에 관한 사항</span>
              <p>
                1) 보험금 추가 청구시에는 당사 홈페이지 또는 손사사고접수센터를
                이용하시면 편리하고 신속하게 보상을 받으실 수 있습니다.
                <br />
                2) 보험금 산정에 이의가 있으신 경우에는 먼저 담당자와 상담하여
                주시기 바라며, 그 밖에 당사 고객서비스팀 또는 소비자보호원 등에
                이의 신청을 하실 수 있습니다. 끝.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PaymentStatement;
