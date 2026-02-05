import React, { useState } from "react";
import styles from "../../../../css/disasterSafeguard/exteriorWallModal.module.css";
import ChkModal from "../../components/ChkModal";

function ExteriorWall({ onSelect, onClose }) {
  const [selectedWall, setSelectedWall] = useState(null);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);

  // 퍼블릭 폴더 내 이미지 경로
  const concreatImg = "/images/safety/concreat.png";
  const brickImg = "/images/safety/brick.png";
  const woodImg = "/images/safety/wood.png";
  const pannelImg = "/images/safety/pannel.png";

  const handleWallSelect = (wallType) => {
    console.log("=== 외벽 타입 선택됨 ===");
    console.log("선택된 외벽:", wallType);
    console.log("=====================");
    setSelectedWall(wallType);
  };

  const handleConfirm = () => {
    if (selectedWall) {
      onSelect(selectedWall);
    }
  };

  const handleDontKnow = () => {
    setSelectedWall(null); // 선택 초기화
    setIsSecondModalOpen(true);
  };

  const handleCloseSecondModal = () => {
    setIsSecondModalOpen(false);
  };

  const handleConfirmSecond = () => {
    console.log("=== 외벽 타입 선택됨 (잘 모르겠어요) ===");
    console.log("선택된 외벽: unknown");
    console.log("====================================");
    setIsSecondModalOpen(false);
    onSelect("unknown"); // "잘 모르겠어요" 선택 시 unknown으로 설정
    onClose();
  };

  return (
    <>
      <div id={styles.containerExterior}>
        <div className={styles.wrap}>
          <div className={styles.mainTitle}>
            <h2>건물 외벽을 선택해주세요</h2>
            <p>보통 건축물 구조와 같은 구조예요</p>
          </div>
          <div className={styles.selectContain}>
            <ul>
              <li>
                <div
                  className={selectedWall === "concrete" ? styles.selected : ""}
                  onClick={() => handleWallSelect("concrete")}
                >
                  콘크리트
                  <img src={concreatImg} alt="콘크리트" loading="lazy" />
                </div>
              </li>
              <li>
                <div
                  className={selectedWall === "brick" ? styles.selected : ""}
                  onClick={() => handleWallSelect("brick")}
                >
                  조적 (벽돌,석조)
                  <img src={brickImg} alt="조적" loading="lazy" />
                </div>
              </li>
            </ul>
            <ul>
              <li>
                <div
                  className={selectedWall === "wood" ? styles.selected : ""}
                  onClick={() => handleWallSelect("wood")}
                >
                  목재
                  <img src={woodImg} alt="목재" loading="lazy" />
                </div>
              </li>
              <li>
                <div
                  className={selectedWall === "panel" ? styles.selected : ""}
                  onClick={() => handleWallSelect("panel")}
                >
                  샌드위치패널
                  <img src={pannelImg} alt="샌드위치패널" loading="lazy" />
                </div>
              </li>
            </ul>
          </div>
          <div className={styles.sectionBtn}>
            <div className={styles.buttonWrap}>
              <div className={styles.buttonContain}>
                <div className={styles.btnDisabled} onClick={handleDontKnow}>
                  잘 모르겠어요
                </div>
                <div
                  className={
                    selectedWall ? styles.buttonActive : styles.buttonDisabled
                  }
                  onClick={selectedWall ? handleConfirm : undefined}
                >
                  선택했어요
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 두 번째 모달창만 사용하도록 설정 */}
      <ChkModal
        isFirstModalOpen={false} // 첫 번째 모달은 사용하지 않음
        isSecondModalOpen={isSecondModalOpen} // 두 번째 모달만 상태에 따라 표시
        onCloseFirstModal={() => {}} // 사용하지 않는 함수
        onCloseSecondModal={handleCloseSecondModal}
        onConfirmFirst={() => {}} // 사용하지 않는 함수
        onConfirmSecond={handleConfirmSecond}
      />
    </>
  );
}

export default ExteriorWall;
