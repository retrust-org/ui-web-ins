import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SafetyButton from "../../../../components/buttons/SafetyButton";
import styles from "../../../../css/disasterSafeguard/LimitsAnnounce.module.css";
import DisasterHeader from "../../../../components/headers/DisasterHeader";
import Loading from "../../../../components/loadings/Loading";
import ErrorModal from "../../../../components/modals/ErrorModal";
import { useSession } from "../../../../context/SessionContext";
import { recordConsent, ConsentError, getErrorMessage } from "../../services/consentService";

// 초과/중복가입 제한 안내 템플릿 ID
const TEMPLATE_ID = 100;

function LimitsAnnounce() {
  const navigate = useNavigate();
  const { sessionToken } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const nextBtn = async () => {
    // sessionToken 존재 여부만 체크 (유효성 검증은 서버에서)
    if (!sessionToken) {
      setError('세션 정보가 없습니다. 보험료 조회부터 다시 진행해 주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // V3 API: recordConsent(sessionToken, consentData)
      await recordConsent(sessionToken, {
        templateId: TEMPLATE_ID,
        consentVersion: '1.0',
        isAgreed: true
      });
      console.log('가입 전 확인사항 동의 기록 완료 (template:', TEMPLATE_ID, ')');
      navigate("/agreement");
    } catch (err) {
      if (err instanceof ConsentError) {
        setError(getErrorMessage(err.code, err.reason));
      } else {
        setError('동의 기록 저장에 실패했습니다.');
      }
      console.error('동의 기록 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <>
      <DisasterHeader title="실손보상 소상공인 풍수해·지진재해보험" />
      <div className={styles.container}>
        <div className={styles.Wrap}>
          <div className={styles.section}>
            <h2 className={styles.highlightText}>초과 및 중복가입 제한 안내</h2>
            <p>
              동일 주소지로 보험계약의 목적과 동일한 사고에 관하여 다수
              개의 풍수해·지진재해 보험계약에 가입하고 그 보험가입금액의
              총액이 보험 가액을 초과한 때에는 행정안전부 지침에 따라 향후
              계약이 취소될 수 있습니다.
            </p>
          </div>
        </div>
        <SafetyButton buttonText="동의하기" onClick={nextBtn}/>
      </div>

      {/* 로딩 표시 */}
      {isLoading && <Loading />}

      {/* 에러 모달 */}
      {error && (
        <ErrorModal
          message="동의 처리 오류"
          subMsg={error}
          onClose={handleCloseError}
        />
      )}
    </>
  );
}

export default LimitsAnnounce;
