import React from "react";
import styles from "../../../css/trip/upload.module.css";
import uploadCircle from "../../../assets/uploadCirCle.svg";
import Button from "../../../components/buttons/Button";
import doubleChk from "../../../assets/doubleChk.svg";
import { useNavigate } from "react-router-dom";

function Upload() {
  const navigate = useNavigate();
  const groupEstimate = () => {
    navigate("/groupEstimate");
  };

  return (
    <>
      <section className={styles.betterSmart}>
        <div className={styles.contents}>
          <h1>
            복잡했던 단체보험
            <br /> 10명이든 100명이든, <span>더 스마트하게</span>
          </h1>
          <div className={styles.hash}>
            <ul>
              <li>동호회</li>
              <li>기업</li>
              <li>단체</li>
            </ul>
          </div>
          <img src="/images/estimatePreview-1.png" alt="간편 견적 미리보기" />
        </div>
      </section>
      <section className={styles.HowToUse}>
        <img src="/images/HowToUse.webp" alt="이용 가이드" />
      </section>
      <section className={styles.checkPoint}>
        <div className={styles.checkPointWrap}>
          <div className={styles.checkPointExcel}>
            <h3>CHECK POINT</h3>
            <p className={styles.chk_subTitle}>
              <span>번거롭게 정보 입력 NO,</span> 양식에 맞게 딱 한 번이면 돼요
            </p>
            <img
              src="/images/excelPreview.png"
              alt="excelPreview"
              className={styles.excelPreviewImages}
            />
            <div className={styles.ExcelInfo}>
              <img src={uploadCircle} alt="uploadCirCle" />
              <p>엑셀에서 정보입력</p>
            </div>
          </div>
          <div className={styles.checkPointPlan}>
            <p className={styles.chk_subTitle}>
              <span>원하는 플랜</span>을 선택 하고
              <br /> 맞춤견적을 받아보세요
            </p>
            <div className={styles.planContents}>
              <img
                src="/images/previewPrice.png"
                alt="previewPrice"
                className={styles.previewPriceImage}
              />
              <div className={styles.TIP}>
                <div className={styles.tipTitle}>
                  <img src={doubleChk} alt="doubleChk" />
                  <p>TIP</p>
                </div>
                <ul className={styles.tipTextBox}>
                  <li>
                    <span>추천 - </span>
                    국가에 맞는 맞춤 보장내용/금액
                  </li>
                  <li>
                    <span>럭셔리 - </span>
                    골프여행이나 소규모 단체 추천
                  </li>
                  <li>
                    <span>갓성비 - </span>BEST 합리적인 플랜
                  </li>
                  <li>
                    <span>초실속 - </span>필요한 보장만 챙기고 저렴하게
                  </li>
                </ul>
              </div>
            </div>
            <div className={styles.ExcelInfo}>
              <img src={uploadCircle} alt="uploadCirCle" />
              <p>원하는 플랜 선택</p>
            </div>
          </div>
        </div>
        <Button buttonText="견적 보러가기" onClick={groupEstimate} />
      </section>
    </>
  );
}

export default Upload;
