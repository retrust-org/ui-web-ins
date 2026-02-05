import React from "react";
import { animated, useSpring } from "react-spring";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import styles from "../../../../css/common/modal.module.css";
import { LodingSpot } from "../../../../components/svgIcons/RestFinishSVG";
import {
  ModalCompleteSvg,
  ModalLodingSvg,
} from "../../../../components/svgIcons/FinishModalIcon";

import { useSelector } from "react-redux";

export const LodingNotice = () => {
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
    delay: 400, // spot1Animation이 시작된 후 400ms 지연
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
    delay: 800, // spot2Animation이 시작된 후 400ms 지연
  });

  return (
    <>
      <ModalLodingSvg />
      <div className={styles.spotsBox}>
        <animated.div style={{ ...spot1Animation, marginLeft: "5px" }}>
          <LodingSpot className={styles.circle} />
        </animated.div>
        <animated.div style={{ ...spot2Animation, marginLeft: "5px" }}>
          <LodingSpot className={styles.circle} />
        </animated.div>
        <animated.div style={{ ...spot3Animation, marginLeft: "5px" }}>
          <LodingSpot className={styles.circle} />
        </animated.div>
      </div>
      <h3 className={styles.h3_Finish}>보험 가입을 완료했어요.</h3>
      <p className={styles.bottomText}>
        가입하신 보험증서로 NFT를 발행하고 있어요.
        <br />
        나만의 지갑에 증서를 안전하게 저장해보세요.
        <br />
        발송된 메일에서도 증서를 볼수 있습니다.
      </p>
    </>
  );
};

export const CompleteNotice = ({ goKlip }) => {
  const hasDeparted = useSelector((state) => state.hasDeparted.isDeparted);

  return (
    <>
      <ModalCompleteSvg />

      <h3 className={styles.h3_Finish}>
        고객님의 NFT 전송이
        <br /> 완료되었습니다.
      </h3>
      <div>
        <p className={styles.middleText} onClick={goKlip}>
          NFT 보러가기
        </p>
      </div>
      <p className={styles.bottomText}>KLIP 지갑에 저장된 NFT를 확인하세요!!</p>
    </>
  );
};

function ModalFinish({ isOpen, onClose, isNFTReceived, goKlip }) {
  const backgroundAnimation = useSpring({
    opacity: isOpen ? 1 : 0,
  });

  return (
    <>
      <animated.div
        className={styles.aimated_div}
        style={backgroundAnimation}
        onClick={onClose}
      >
        <div className={styles.modalWrap}>
          <div className={styles.closeBOX}>
            <FontAwesomeIcon
              icon={faTimes}
              className={styles.closeIcon}
              onClick={onClose}
            />
          </div>
          {isNFTReceived ? (
            <CompleteNotice goKlip={goKlip} />
          ) : (
            <LodingNotice />
          )}
        </div>
      </animated.div>
    </>
  );
}

export default ModalFinish;
