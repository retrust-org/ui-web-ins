import React, { useState, useEffect } from "react";
import styles from "../../css/common/loadings.module.css";
import loading1 from "../../assets/loading1.svg";
import loading2 from "../../assets/loading2.svg";
import loading3 from "../../assets/loading3.svg";
import loading4 from "../../assets/loading4.svg";
import loading5 from "../../assets/loading5.svg";
import loading6 from "../../assets/loading6.svg";
import loading7 from "../../assets/loading7.svg";
import loading8 from "../../assets/loading8.svg";

function Loadings() {
  const loadings = [
    loading1,
    loading2,
    loading3,
    loading4,
    loading5,
    loading6,
    loading7,
    loading8,
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % loadings.length);
    }, 800);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className={styles.overlay}>
      <div className={styles.loadingContainer}>
        <img
          src={loadings[currentIndex]}
          alt={`Loading ${currentIndex + 1}`}
          className={styles.loadingImage}
        />
      </div>
    </div>
  );
}

export default Loadings;
