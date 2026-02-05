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
              <img src="/images/longterm/longtermMain.png" alt="메인이미지" />
            </div>
          </div>

          <div className={styles.targetwrap}>
            <h2>3개월 이상 여행이라면 가입 가능해요!</h2>
            <div className={styles.target}>
              <div className={styles.target1}>
                <img src="/images/longterm/target3.png" width="90%" alt="" />
              </div>
              <div className={styles.target2}>
                <img src="/images/longterm/target2.png" width="90%" alt="" />
              </div>
              <div className={styles.target3}>
                <img src="/images/longterm/target1.png" width="90%" alt="" />
              </div>
            </div>
          </div>

          <div className={styles.guaranteewrap}>
            <span>💖 든든한 기본 보장</span>
            <ul className={styles.guarantee}>
              <li>
                <img src="/images/longterm/grt1.png" width="100%" alt="" />
              </li>
              <li>
                <img src="/images/longterm/grt2.png" width="100%" alt="" />
              </li>
              <li>
                <img src="/images/longterm/grt3.png" width="100%" alt="" />
              </li>
            </ul>
          </div>

          <div className={styles.plus}>
            <img src="/images/longterm/plus.png" width="15%" alt="" />
          </div>

          <div className={styles.pointwrap}>
            <div className={styles.subtitle}></div>
            <span className={styles.spoint}>GOOD POINT</span>
            <h2 className={styles.service}>
              전세계 어디서든
              <div className={styles.svpoint}>
                <p>24시간 우리말 상담</p>을 도와드려요
              </div>
            </h2>

            <div className={styles.point1}>
              <span>💊아플 때는 병원으로</span>
              <div className={styles.pointbox}>
                <ul>
                  <li>
                    <img src="/images/longterm/point1.png" alt="" />
                  </li>
                  <li>
                    <img src="/images/longterm/point2.png" alt="" />
                  </li>
                </ul>
              </div>
              <span className={styles.rsv}>현지병원 안내/예약</span>
            </div>

            <div
              style={{
                borderBottom: "0.4px solid rgba(88, 88, 88, 0.3)",
                width: "90%",
                margin: "15px auto",
              }}
            ></div>

            <div className={styles.point2}>
              <span>👀이럴 때 당황하지 않기</span>
              <div className={styles.pointbox}>
                <ul>
                  <li>
                    <div>
                      <img src="/images/longterm/point3.png" alt="" />
                    </div>
                  </li>
                  <li>
                    <div>
                      <img src="/images/longterm/point4.png" alt="" />
                    </div>
                  </li>
                </ul>
              </div>
              <span className={styles.rsv}>통역사/변호사 알선</span>
            </div>
            <cite className={styles.cite}>
              준법감시인 심의필 제2025-광고-599호(2025.03.25~2026.03.24)
            </cite>
          </div>
        </div>
        <button className={styles.introBtn} onClick={handleButtonClick}>
          보험료 조회하기
        </button>
      </div>
    </>
  );
}

export default Intro;
