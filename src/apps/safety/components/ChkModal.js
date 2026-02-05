import React from "react";
import BaseModalCenter from "../../../components/layout/BaseModalCenter";
import cancel from "../../../assets/commonX.svg";
import styles from "../../../css/disasterSafeguard/chkModal.module.css";

function ChkModal({
  isFirstModalOpen,
  isSecondModalOpen,
  onCloseFirstModal,
  onCloseSecondModal,
  onConfirmFirst,
  onConfirmSecond,
}) {
  return (
    <>
      {/* 첫번째 모달창 */}
      <BaseModalCenter isOpen={isFirstModalOpen} onClose={onCloseFirstModal}>
        <section className={styles.modalSection}>
          <div className={styles.closeButton}>
            <img src={cancel} alt="닫기" onClick={onCloseFirstModal} />
          </div>
          <h1 className={styles.modalTitle}>꼭 확인해주세요</h1>
          <div className={styles.modalText}>
            <p>조회 및 가입 과정에서 편의상</p>
            <p>자동으로 제공되는 정보는 꼭 확인하시고,</p>
            <p>정보가 다를 시에는 반드시 정보를 수정해주세요.</p>
          </div>
          <div className={styles.modalText}>
            <p>잘못된 정보로 보험 가입이 이루어진 경우</p>
            <p>그 책임은 이용자 본인에게 있음을 알려드립니다.</p>
          </div>
          <button className={styles.confirmButton} onClick={onConfirmFirst}>
            네, 확인했어요
          </button>
        </section>
      </BaseModalCenter>

      {/* 두번째 모달창 */}
      <BaseModalCenter isOpen={isSecondModalOpen} onClose={onCloseSecondModal}>
        <section className={styles.modalSection}>
          <div className={styles.closeButton}>
            <img src={cancel} alt="닫기" onClick={onCloseSecondModal} />
          </div>
          <h1 className={styles.modalTitle}>외벽구조를 모르시나요?</h1>
          <div className={styles.modalText_2nd}>
            <p>괜찮아요, 잘 모를 수 있어요 :)</p>
            <p>
              인슈어트러스트가{" "}
              <span>
                건축유형과 연식에 맞는 <br />
                구조
              </span>
              를 추측해드릴게요!
            </p>
            <span className={styles.matching}>
              정확한 매칭이 안 될 시 높은 보험료 가격으로
              <br /> 책정 될 수도 있어요
            </span>
          </div>
          <button className={styles.confirmButton} onClick={onConfirmSecond}>
            네, 동의합니다
          </button>
        </section>
      </BaseModalCenter>
    </>
  );
}

export default ChkModal;
