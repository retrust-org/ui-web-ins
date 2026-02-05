import React from "react";
import BaseModalBottom from "../../../components/layout/BaseModalBottom";
import styles from "../../../css/claim/parentChk.module.css";
import AdultAuth from "../auth/AdultAuth";
import ErrorModal from "../../../components/modals/ErrorModal";

function ParentChk({
  onClose,
  receptionistInfo,
  isAuthInProgress,
  onAuthStart,
  onAuthSuccess,
  onAuthError,
}) {
  // 에러 상태는 상위 컴포넌트에서 관리
  const [authError, setAuthError] = React.useState(null);

  // 본인인증 시작 핸들러
  const handleAuthStart = () => {
    setAuthError(null); // 이전 에러 초기화
    if (onAuthStart) {
      onAuthStart();
    }
  };

  // 본인인증 성공 핸들러
  const handleAuthSuccess = () => {
    setAuthError(null);
    if (onAuthSuccess) {
      onAuthSuccess();
    }
  };

  // 본인인증 실패 핸들러
  const handleAuthError = (errorMessage) => {
    setAuthError(errorMessage);
    if (onAuthError) {
      onAuthError(errorMessage);
    }
  };

  // 에러 모달 닫기 핸들러
  const handleCloseErrorModal = () => {
    setAuthError(null);
    // 에러 모달 닫은 후 ParentChk 모달도 닫기
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      <BaseModalBottom onClose={onClose}>
        <div className={styles.parentChkContainer}>
          <section className={styles.parentChkSection}>
            <h2>접수하시는 분이 친권자인가요?</h2>
            <p>접수하시는 분이 친권자가 아닐 경우 접수가 불가합니다.</p>
          </section>
        </div>
        <AdultAuth
          parentChk={true}
          receptionistInfo={receptionistInfo}
          isAuthInProgress={isAuthInProgress}
          onAuthStart={handleAuthStart}
          onAuthSuccess={handleAuthSuccess}
          onAuthError={handleAuthError}
        />
      </BaseModalBottom>

      {/* 에러 모달 */}
      {authError && (
        <ErrorModal
          isOpen={true}
          message={authError}
          onClose={handleCloseErrorModal}
        />
      )}
    </>
  );
}

export default ParentChk;
