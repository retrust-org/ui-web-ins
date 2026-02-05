import styles from "./index.module.css";
import overseasSvg from "../../assets/overseas.svg";
import departedSvg from "../../assets/departed.svg";
import longtermSvg from "../../assets/longterm.svg";
import domesticSvg from "../../assets/domestic.svg";
import banner1Svg from "../../assets/banner1.svg";
import banner2Svg from "../../assets/banner2.svg";
import Footer from "../../components/footer/Footer";
import MainHeader from "../../components/headers/MainHeader";

function Trip() {
  return (
    <>
      <MainHeader />
      <div className={styles.Contents}>
   
      <section className={styles.Title}>
        <div className={styles.imagesWrap}>
            <img src="/images/trip_mainImage.png" alt="트립 메인이미지" />
          
        </div>
      </section>
      <section className={styles.gridSection}>
        <div className={styles.gridContainer}>
          <a
            href="/trip/overseas"
            className={`${styles.gridItem} ${styles.tall}`}
          >
            <span className={`${styles.badge} ${styles.best}`}>Best</span>
            <div className={styles.iconWrapper}>
              <img
                src={overseasSvg}
                alt="지구 아이콘"
                className={styles.icon}
              />
            </div>
            <span className={styles.categoryText}>해외여행</span>
          </a>

          <a href="/trip/longterm" className={`${styles.gridItem}`}>
            <div className={styles.iconWrapper}>
              <img
                src={longtermSvg}
                alt="여행가방 아이콘"
                className={styles.icon}
              />
            </div>
            <span className={styles.categoryText}>장기체류</span>
          </a>

          <a href="/trip/departed" className={`${styles.gridItem}`}>
            <span className={`${styles.badge} ${styles.hot}`}>Hot</span>
            <div className={styles.iconWrapper}>
              <img
                src={departedSvg}
                alt="스톱워치 아이콘"
                className={styles.icon}
              />
            </div>
            <span className={styles.categoryText}>출국 후</span>
          </a>

          <a
            href="/trip/domestic"
            className={`${styles.gridItem} ${styles.large}`}
          >
            <span className={`${styles.badge} ${styles.new}`}>New</span>
            <div className={styles.iconWrapper}>
              <img
                src={domesticSvg}
                alt="열기구 아이콘"
                className={styles.icon}
              />
            </div>
            <span className={styles.categoryText}>국내여행</span>
          </a>
        </div>
      </section>
      <section className={styles.bannerSection}>
        <div className={styles.banner}>
          <div className={styles.imageWrap}>
            <img src={banner1Svg} alt="배너 1" />
          </div>
          <div className={styles.imageWrap}>
            <img src={banner2Svg} alt="배너 2" />
          </div>
        </div>
      </section>
      <div className={styles.footer}>
        <Footer />
      </div>
    </div>
    </>
    
  );
}

export default Trip;
