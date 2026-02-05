import React from "react";
import styles from "../../../../css/longterm/intro.module.css";
import { useNavigate } from "react-router-dom";
import MainHeader from "../../../../components/headers/MainHeader";

function Intro() {
  const navigate = useNavigate();
  const handleButtonClick = () => {
    navigate("/insert");
  };

  return (
    <>
      <div className={styles.section}>
        <MainHeader />
        <div className={styles.container}>
          <div className={styles.main}>
            <div className={styles.imagesWrap}>
              <img src="/images/domestic/domesticMain.png" alt="메인이미지" />
            </div>
          </div>

          <div className={styles.targetwrap}>
            <h2>여행의 모든 순간을 즐겁게, 안전한 국내여행 보험</h2>
            <div className={styles.target}>
              <div className={styles.target1}>
                <img
                  src="/images/domestic/personal.png"
                  width="100%"
                  alt="personal"
                />
              </div>
              <div className={styles.target2}>
                <img
                  src="/images/domestic/group.png"
                  width="100%"
                  alt="group"
                />
              </div>
              <div className={styles.target3}>
                <img
                  src="/images/domestic/foreigner.png"
                  width="100%"
                  alt="foreigner"
                />
              </div>
            </div>
          </div>
          <div className={styles.guaranteewrap}>
            <span>💖 든든한 기본 보장</span>
            <ul className={styles.guarantee}>
              <li>
                <div>
                  <img src="/images/longterm/grt1.png" width="90%" alt="" />
                </div>
              </li>
              <li>
                <div>
                  <img src="/images/longterm/grt2.png" width="90%" alt="" />
                </div>
              </li>
              <li>
                <div>
                  <img src="/images/longterm/grt3.png" width="90%" alt="" />
                </div>
              </li>
            </ul>
          </div>

          <div className={styles.plus}>
            <img src="/images/longterm/plus.png" width="15%" alt="" />
          </div>
          <div className={styles.goodPoint}>
            <div className={styles.goodPointTitle}>
              <h2>GOOD POINT</h2>
            </div>
            <section className={styles.goodPointContents}>
              <article>
                <div className={styles.articleWrap}>
                  <span>단체견적</span>
                  <h3>
                    엠티, 오티, 동호회 등<br /> 단체에게 추천해요
                  </h3>
                  <p>본인인증없이 쉽고 간단한 가입절차!</p>
                  <img
                    src="/images/domestic/domesticGoodpoint_upload.png"
                    alt="domesticGoodpoint_upload"
                    width={326}
                    height={175}
                  />
                </div>
              </article>
              <div className={styles.lineWrap}>
                <div className={styles.line}></div>
              </div>
              <article>
                <div className={styles.articleWrap}>
                  <span>레저특화</span>
                  <h3>활동적인 일정에도 걱정마세요</h3>
                  <p>
                    특약- 골절 수술비, 상해응급실내원율, 골절진단비,
                    <br /> 깁스치료비, 상해 수술비, 상해/질병 급여 의료비
                  </p>
                  <img
                    src="/images/domestic/domesticGoodpoint_activity.png"
                    alt="domesticGoodpoint_activity"
                    width={226}
                    height={226}
                  />
                </div>
              </article>
              <cite>
                준법감시인 심의필 제2025-광고-681호(2025.04.03~2026.04.02)
              </cite>
            </section>
          </div>
          <button className={styles.introBtn} onClick={handleButtonClick}>
            보험료 조회하기
          </button>
        </div>
      </div>
    </>
  );
}

export default Intro;
