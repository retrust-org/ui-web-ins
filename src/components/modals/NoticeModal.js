import React from "react";
import BaseModalCenter from "../layout/BaseModalCenter";
import styles from "../../css/disasterSafeguard/noticeModal.module.css";

function NoticeModal({ isOpen, onClose, onReSearch }) {
  return (
    <BaseModalCenter isOpen={isOpen} onClose={onClose}>
      <div className={styles.noticeModalContent}>
        <h2 className={styles.title}>안내</h2>
        <div className={styles.description}>
          <p className={styles.mainText}>
            여러 건물 등급이 있으며,
            <br />
            전체 가입 시 최저 등급으로 적용됩니다.
          </p>
          <p className={styles.subText}>
            정확한 가입은 개별 가입을 추천드립니다.
          </p>
          <p className={styles.notice}>*건물 등급에 따라 보험료가 달라집니다.</p>
        </div>
        <div className={styles.buttonGroup}>
          <button className={styles.reSearchButton} onClick={onReSearch}>
            주소재검색
          </button>
          <button className={styles.continueButton} onClick={onClose}>
            계속하기
          </button>
        </div>
      </div>
    </BaseModalCenter>
  );
}

export default NoticeModal;
