import { useLocation, useParams } from "react-router-dom";
import { useState } from "react";
import ClaimHeader from "../../claim/components/ClaimHeader";
import styles from "../../../css/claim/claimReferralDetail.module.css";
import sms from "../../../assets/sms.svg";
import email from "../../../assets/email.svg";
import SendNftSms from "./SendNftSms";
import SendNftEmail from "./SendNftEmail";

function ClaimReferralDetail() {
  const { card_id } = useParams();
  const location = useLocation();
  const { nftData } = location.state || { nftData: [] };
  const filteredData = nftData.find(
    (item) => item.card_id === parseInt(card_id)
  );
  const [currentView, setCurrentView] = useState("main");

  const handleSmsClick = () => setCurrentView("sms");
  const handleEmailClick = () => setCurrentView("email");
  const handleBack = () => setCurrentView("main");

  return (
    <>
      <ClaimHeader titleText="NFT 엽서 보내기" />
      <div className={styles.container}>
        <div className={styles.containerWrap}>
          <div className={styles.contents}>
            <div
              className={`${styles.viewContainer} ${
                currentView === "main" ? styles.active : ""
              }`}
            >
              <div className={styles.selectedInfo}>
                <span>선택한 NFT</span>
                <div className={styles.selectedInfoContents}>
                  <div className={styles.contentsBox}>
                    <div className={styles.contentsIamges}>
                      <div className={styles.imageWrap}>
                        <img src={filteredData?.imageUri} alt="Selected NFT" />
                      </div>
                      <div className={styles.nftInfos}>
                        <p>선택된 나라 : {filteredData?.nation}</p>
                        <p>
                          해당 보험 기간 :{" "}
                          {filteredData?.Contract?.insurance_start_date} ~{" "}
                          {filteredData?.Contract?.insurance_end_date}
                        </p>
                        <p>
                          기본 제공 엽서는 {filteredData?.remainingQuantity}회
                          남았습니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.selectedMethod}>
                <span className={styles.titles}>발송 방법을 선택해주세요.</span>
                <div className={styles.selectedContents}>
                  <div className={styles.selected} onClick={handleSmsClick}>
                    <img src={sms} alt="sms" />
                    <p>SMS 발송</p>
                  </div>
                  <div className={styles.selected} onClick={handleEmailClick}>
                    <img src={email} alt="email" />
                    <p>EMAIL 발송</p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`${styles.viewContainer} ${
                currentView === "sms" ? styles.active : ""
              }`}
            >
              <SendNftSms onClose={handleBack} cardId={card_id} />
            </div>

            <div
              className={`${styles.viewContainer} ${
                currentView === "email" ? styles.active : ""
              }`}
            >
              <SendNftEmail onClose={handleBack} cardId={card_id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ClaimReferralDetail;
