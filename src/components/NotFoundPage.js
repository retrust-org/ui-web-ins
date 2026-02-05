import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/common/notFoundPage.module.css";

function NotFoundPage() {
  const navigate = useNavigate();
  const [timer, setTimer] = useState(5); // 타이머 초 초기값 설정

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1); // 1초씩 감소

      if (timer === 0) {
        clearInterval(interval); // 타이머 종료
        window.location.href = "/";
      }
    }, 1000); // 1초마다 실행

    return () => clearInterval(interval); // 컴포넌트가 언마운트될 때 타이머 정리
  }, [timer, navigate]);

  return (
    <>
      <section className={styles.notFoundWrap}>
        <div className={styles.LogoBox}>
          <img
            alt="리트러스트Logo"
            src={process.env.PUBLIC_URL + "images/introIMG/REtrust_s.png"}
          />
          <h1>404</h1>
          <h2>Page Not Found</h2>
        </div>
        <div className={styles._404Img}>
          <img
            alt="404Found"
            src={
              process.env.PUBLIC_URL + "images/NotFoundPageImg/img_error.png"
            }
          />
        </div>
        <div>
          <p
            style={{
              color: "#96989c",
              textAlign: "center",
              fontSize: "16px",
              fontStyle: "normal",
              fontWeight: 500,
              lineHeight: "24px" /* 150% */,
            }}
          >
            홈으로 자동 이동합니다...{timer}초
          </p>
        </div>
      </section>
    </>
  );
}

export default NotFoundPage;
