import React from "react";
import { animated, useSpring } from "react-spring";
import styles from "../../css/common/spotLoading.module.css";
import { LodingSpot } from "../svgIcons/RestFinishSVG";
import { ModalLodingSvg } from "../svgIcons/FinishModalIcon";

export const SpotLoading = () => {
  const spot1Animation = useSpring({
    from: { transform: "translateY(0px)" },
    to: async (next) => {
      while (true) {
        await next({ transform: "translateY(-5px)" });
        await next({ transform: "translateY(0px)" });
      }
    },
    config: { tension: 100, friction: 10 },
  });

  const spot2Animation = useSpring({
    from: { transform: "translateY(0px)" },
    to: async (next) => {
      while (true) {
        await next({ transform: "translateY(-5px)" });
        await next({ transform: "translateY(0px)" });
      }
    },
    config: { tension: 100, friction: 10 },
    delay: 400,
  });

  const spot3Animation = useSpring({
    from: { transform: "translateY(0px)" },
    to: async (next) => {
      while (true) {
        await next({ transform: "translateY(-5px)" });
        await next({ transform: "translateY(0px)" });
      }
    },
    config: { tension: 100, friction: 10 },
    delay: 800,
  });

  return (
    <div className={styles.aimated_div}>
      <div className={styles.animated_div2}>
        <div className={styles.modalWrap}>
          <div className={styles.closeBOX}>
            {/* Add close icon here if needed */}
          </div>
          <ModalLodingSvg />
          <h3 className={styles.h3_Finish}>전송 진행중 입니다.</h3>
          <div className={styles.spotsBox}>
            <animated.div style={spot1Animation}>
              <LodingSpot className={`${styles.circle} ${styles.circle1}`} />
            </animated.div>
            <animated.div style={spot2Animation}>
              <LodingSpot className={`${styles.circle} ${styles.circle2}`} />
            </animated.div>
            <animated.div style={spot3Animation}>
              <LodingSpot className={`${styles.circle} ${styles.circle3}`} />
            </animated.div>
          </div>
          <p className={styles.middleText}>잠시만 기다려 주세요.</p>
          <p className={styles.bottomText}>This may take a few seconds</p>
        </div>
      </div>
    </div>
  );
};
