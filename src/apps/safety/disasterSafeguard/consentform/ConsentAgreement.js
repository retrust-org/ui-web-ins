import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../../../css/disasterSafeguard/consentAgreement.module.css";
import buttonChk from "../../../../assets/buttonChk.svg";
import buttonActiveChk from '../../../../assets/safety-activeChk.svg'
import DisasterHeader from "../../../../components/headers/DisasterHeader";
import Loading from '../../../../components/loadings/Loading';
import ErrorModal from '../../../../components/modals/ErrorModal';
import { useSession } from "../../../../context/SessionContext";
import { recordConsent, ConsentError, isSessionError, getErrorMessage } from "../../services/consentService";

// 동의 항목별 templateId 매핑 (수집이용: 1-3, 제공: 4-6, 조회: 7-9)
const TEMPLATE_IDS = {
  0: 101, // 수집이용 - 고유식별정보
  1: 102, // 수집이용 - 민감정보
  2: 103, // 수집이용 - 개인신용정보
  3: 104, // 제공 - 고유식별정보
  4: 105, // 제공 - 민감정보
  5: 106, // 제공 - 개인신용정보
  6: 107, // 조회 - 고유식별정보
  7: 108, // 조회 - 민감정보
  8: 109, // 조회 - 개인신용정보
};

// 반복되는 동의 항목 컴포넌트로 분리
const ConsentSection = ({ title, sectionIndex, consentStates, onSetConsent }) => (
  <div className={styles.agree} id={`section-${sectionIndex}`}>
    <h3>아래 정보의 수집 및 이용에 동의해주세요</h3>
    <div className={styles.buttonWrap}>
      <ul>
        <li id={`consent-item-${sectionIndex * 3}`}>
          <p>1. 고유식별정보</p>
          <div className={styles.consentButtons}>
            <div
              className={`${styles.button} ${consentStates[sectionIndex * 3] === 1 ? styles.active : ''}`}
              onClick={() => onSetConsent(sectionIndex * 3, 1)}
            >
              <img src={consentStates[sectionIndex * 3] === 1 ? buttonActiveChk : buttonChk} alt="동의 체크" />
              동의
            </div>
            <div
              className={`${styles.button} ${consentStates[sectionIndex * 3] === -1 ? styles.active : ''}`}
              onClick={() => onSetConsent(sectionIndex * 3, -1)}
            >
              <img src={consentStates[sectionIndex * 3] === -1 ? buttonActiveChk : buttonChk} alt="미동의 체크" />
              미동의
            </div>
          </div>
        </li>
        <li id={`consent-item-${sectionIndex * 3 + 1}`}>
          <p>2. 민감정보</p>
          <div className={styles.consentButtons}>
            <div
              className={`${styles.button} ${consentStates[sectionIndex * 3 + 1] === 1 ? styles.active : ''}`}
              onClick={() => onSetConsent(sectionIndex * 3 + 1, 1)}
            >
              <img src={consentStates[sectionIndex * 3 + 1] === 1 ? buttonActiveChk : buttonChk} alt="동의 체크" />
              동의
            </div>
            <div
              className={`${styles.button} ${consentStates[sectionIndex * 3 + 1] === -1 ? styles.active : ''}`}
              onClick={() => onSetConsent(sectionIndex * 3 + 1, -1)}
            >
              <img src={consentStates[sectionIndex * 3 + 1] === -1 ? buttonActiveChk : buttonChk} alt="미동의 체크" />
              미동의
            </div>
          </div>
        </li>
        <li id={`consent-item-${sectionIndex * 3 + 2}`}>
          <p>3. 개인신용정보</p>
          <div className={styles.consentButtons}>
            <div
              className={`${styles.button} ${consentStates[sectionIndex * 3 + 2] === 1 ? styles.active : ''}`}
              onClick={() => onSetConsent(sectionIndex * 3 + 2, 1)}
            >
              <img src={consentStates[sectionIndex * 3 + 2] === 1 ? buttonActiveChk : buttonChk} alt="동의 체크" />
              동의
            </div>
            <div
              className={`${styles.button} ${consentStates[sectionIndex * 3 + 2] === -1 ? styles.active : ''}`}
              onClick={() => onSetConsent(sectionIndex * 3 + 2, -1)}
            >
              <img src={consentStates[sectionIndex * 3 + 2] === -1 ? buttonActiveChk : buttonChk} alt="미동의 체크" />
              미동의
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
);

function ConsentAgreement() {
  const navigate = useNavigate();
  const { sessionToken, clearSession } = useSession();

  // 9개 동의 항목 상태 관리 (0: 선택안함, 1: 동의, -1: 미동의)
  const [consentStates, setConsentStates] = useState(new Array(9).fill(0));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSessionErrorFlag, setIsSessionErrorFlag] = useState(false);

  // 동의 기록 API 호출
  const saveConsentRecord = async (index, isAgreed) => {
    // sessionToken 존재 여부만 체크 (유효성 검증은 서버에서)
    if (!sessionToken) {
      setError('세션 정보가 없습니다. 보험료 조회부터 다시 진행해 주세요.');
      return false;
    }

    try {
      // V3 API: recordConsent(sessionToken, consentData)
      await recordConsent(sessionToken, {
        templateId: TEMPLATE_IDS[index],
        consentVersion: '1.0',
        isAgreed
      });
      return true;
    } catch (err) {
      if (err instanceof ConsentError) {
        const errorMessage = getErrorMessage(err.code, err.reason);
        setError(errorMessage);

        // 세션 관련 에러인 경우 플래그 설정
        if (isSessionError(err.code)) {
          setIsSessionErrorFlag(true);
        }
      } else {
        setError('동의 기록 저장에 실패했습니다.');
      }
      console.error('동의 기록 실패:', err);
      return false;
    }
  };

  // 동의/미동의 설정 함수
  const setConsentState = async (index, value) => {
    // 동의일 경우 API 호출
    if (value === 1) {
      setIsLoading(true);
      const success = await saveConsentRecord(index, true);
      setIsLoading(false);

      if (!success) {
        return; // API 실패 시 상태 변경 안 함
      }
    }

    setConsentStates(prev => {
      const newStates = [...prev];
      newStates[index] = value;
      return newStates;
    });
  };

  // 동의 완료 개수 계산
  const agreedCount = consentStates.filter(state => state === 1).length;

  // 미동의 개수 계산
  const disagreeCount = consentStates.filter(state => state === -1).length;

  // 현재 진행 중인 섹션 계산 (0: 수집이용, 1: 제공, 2: 조회, 3: 완료)
  const getCurrentSection = () => {
    if (agreedCount < 3) return 0; // 수집·이용
    if (agreedCount < 6) return 1; // 제공
    if (agreedCount < 9) return 2; // 조회
    return 3; // 완료
  };

  const currentSection = getCurrentSection();

  // 섹션별 텍스트
  const sectionTexts = ["수집·이용 동의하기", "제공 동의하기", "조회 동의하기", "다음으로"];

  // 플로팅 버튼 비활성화 여부 (미동의가 하나라도 있으면 비활성화)
  const isButtonDisabled = disagreeCount > 0;

  // 플로팅 버튼 클릭 핸들러
  const handleFloatingButtonClick = async () => {
    if (currentSection < 3) {
      // 해당 섹션으로 스크롤
      const sectionElement = document.getElementById(`section-${currentSection}`);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // 해당 섹션의 3개 항목 모두 동의로 체크 (API 호출 포함)
      const startIndex = currentSection * 3;
      setIsLoading(true);

      try {
        // 각 항목에 대해 API 호출
        for (let i = 0; i < 3; i++) {
          const index = startIndex + i;
          // 이미 동의한 항목은 스킵
          if (consentStates[index] !== 1) {
            const success = await saveConsentRecord(index, true);
            if (!success) {
              setIsLoading(false);
              return; // API 실패 시 중단
            }
          }
        }

        // 상태 업데이트
        setConsentStates(prev => {
          const newStates = [...prev];
          newStates[startIndex] = 1;
          newStates[startIndex + 1] = 1;
          newStates[startIndex + 2] = 1;
          return newStates;
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // 미동의가 있으면 다음 페이지로 이동 안 함
      if (isButtonDisabled) {
        return;
      }
      // 모두 완료 시 다음 페이지로 이동
      navigate('/personalInfoConsent');
    }
  };

  // 에러 모달 닫기
  const handleCloseError = () => {
    setError(null);

    // 세션 에러인 경우 세션 정리 후 /price로 이동
    if (isSessionErrorFlag) {
      setIsSessionErrorFlag(false);
      clearSession();
      navigate('/price');
    }
  };

  return (
    <>
      <DisasterHeader title="실손보상 소상공인 풍수해·지진재해보험" />
      <div className={styles.container}>
      <div className={styles.Wrap}>
        <div className={styles.mainTitle}>
          <h1 className={styles.highlightText}>
            고객 정보관리 및 가입설계를 위한
          </h1>
          <h1 className={styles.highlightText}>개인(신용)정보 처리 동의서</h1>
        </div>

        {/* 메리츠화재 섹션 */}
        <div className={styles.section}>
          <h2>메리츠화재해상보험주식회사 귀중</h2>
          <p>
            귀하는 개인(신용)정보의 수집·이용 및 조회, 제공에 관한 동의를
            거부하실 수 있으며, 개인의 신용도 등을 평가하기 위한 목적 이외의
            개인(신용)정보 제공 동의는 철회할 수 있습니다.
          </p>
          <p>
            다만, 본 동의는 '보험계약 인수심사·체결·이행·유지·관리'를 위해
            필수적인 사항이므로 동의를 거부하시는 경우 관련 업무 수행이
            불가능합니다. 또한 본 동의서에 의한 개인(신용)정보 조회는 귀하의
            개인신용평점에 영향을 주지 않습니다.
          </p>
        </div>

        {/* 수집·이용에 관한 사항 섹션 */}
        <div className={styles.section}>
          <h2>수집·이용에 관한 사항</h2>
          <p>
            1. 수집·이용목적
            <br />
            - 보험계약상담, 재무설계서비스, 보험계약인수여부판단(건강진단 및
            계약적부조사 포함)
            <br />- 실손형보험 중복확인 및 정액담보가입사항 확인을 위한 당사
            타사보험가입조회, 보험가입의무대상확인, 민원 및 분쟁관련 대응,
            보험료 수납업무
          </p>

          <p>
            2. 보유 및 이용기간
            <br />- 동의일로부터 1년까지
          </p>

          <p>
            3. 수집·이용 항목
            <br />
            ① 고유식별정보 : 주민등록번호, 외국인등록번호, 여권번호,
            운전면허번호
            <br />
            ② 민감정보 : 피보험자의 질병·상해에 관한 정보(진료기록, 상병명,
            기왕증, 흡연여부 등) 교통법규위반정보
            <br />
            ③ 개인(신용정보)
            <br />
            - 일반개인정보: 성명, CI, 주소, 생년월일, 이메일, 유·무선전화번호,
            국적, 직업, 운전여부, 주행거리정보, 국내거소신고번호, 상호명,
            업종명, 보험가입의무대상일련번호
            <br />
            - 신용거래정보: 본인계좌(카드)정보, 보험계약정보(상품종류,
            보험가입금액 등)·보험금정보(보험금지급사유, 지급금액 등), 계약 전
            알릴의무사항, 타사인수비교를 위한 자료
            <br />- 신용능력정보: 소득 및 신용도 판단정보
          </p>
          <hr className={styles.line} />
        </div>

        {/* 첫 번째 동의 섹션 */}
        <ConsentSection
          title="수집·이용"
          sectionIndex={0}
          consentStates={consentStates}
          onSetConsent={setConsentState}
        />
        <hr className={styles.division} />

        {/* 제공에 관한 사항 섹션 */}
        <div className={styles.section}>
          <h2>제공에 관한 사항</h2>
          <p>
            1. 제공받는 자
            <br />- 보험모집업무/설계지원업무를 위탁받은자(대리점, 설계사 등),
            국내재보험사, 종합신용정보집중기관, 생명·손해보험협회,
            보험요율산출기관, 금융거래기관, 코리안크레딧뷰로, 본인인증기관,
            의무보험관계법령의 소관부처 및 그 상·하급 정부조직·공공기관
          </p>
          <p>
            2. 제공받는자의 이용목적
            <br />
            - 보험계약상담(보장분석포함), 가입설계, 가입설계지원
            <br />
            - 국내재보험사: 보험계약인수여부판단
            <br />- 종합신용정보집중기관, 생명·손해보험협회, 보험요율산출기관,
            금융거래기관, 코리안크레딧뷰로, 본인인증기관, 의무보험관계법령의
            소관부처 및 그 상·하급정부조직·공공기관: 개인(신용)정보조회
          </p>
          <p>
            3. 보유 및 이용기간
            <br />
            - 동의일로부터 3개월까지
            <br />※ 외국 재보험사의 국내지점이 재보험계약 가입 판단 지원,
            보험계약 공동인수 지원 업무를 위탁하기 위한 경우 별도의 동의 없이
            외국 소재 본점에 귀하의 정보를 이전할 수 있습니다.
          </p>
          <p>
            4. 제공 항목
            <br />
            ① 고유식별정보 : 주민등록번호, 외국인등록번호, 여권번호,
            운전면허번호
            <br />
            ② 민감정보 : 피보험자의 질병·상해에 관한 정보(진료기록, 상병명,
            기왕증, 흡연여부 등) 교통법규위반정보
            <br />
            ③ 개인(신용정보)
            <br />
            - 일반개인정보: 성명, 국내거소신고번호, 주소, 유·무선전화번호,
            상호명, 업종명, 보험가입 의무대상 일련번호
            <br />
            - 신용거래정보: 보험계약정보(상품종류, 보험가입금액
            등)·보험금정보(보험금 지급사유, 지급금액 등)·계약 전
            알릴의무사항(취미등)
            <br />※ 업무위탁을 목적으로 개인(신용)정보 처리하는 경우 별도의
            동의없이 업무수탁자에게 귀하의 정보를 제공할 수 있습니다.
            (홈페이지(www.meritzfire.com)에서 확인가능)
          </p>
          <hr className={styles.line} />

          {/* 두 번째 동의 섹션 */}
          <ConsentSection
            title="제공"
            sectionIndex={1}
            consentStates={consentStates}
            onSetConsent={setConsentState}
          />
        </div>
        <hr className={styles.division} />

        {/* 조회에 관한 사항 섹션 */}
        <div className={styles.section}>
          <h2>조회에 관한 사항</h2>
          <p>
            1. 조회 대상 기관
            <br />
            종합신용정보집중기관, 생명·손해보험협회, 보험요율산출기관,
            금융거래기관, 코리안크레딧뷰로, 본인인증기관, 의무보험관계법령의
            소관부처 및 그 상·하급정부조직·공공기관·자동차제조회사
          </p>
          <p>
            2. 조회 목적
            <br />
            - 종합신용정보집중기관 : 보험계약 인수여부 결정을 위한 판단, 보험
            가입한도 조회, 실제 발생하는 손해를 보상하는 실손형 보험의 중복가입
            <br />
            - 생명·손해보험협회, 의무보험 관계법령의 소관부처 및 그 상·하급
            정부조직·공공기관 : 보험가입 의무대상 확인
            <br />
            - 자동차제조회사 : 차량모델 및 부속장치 확인
            <br />
            - 보험요율산출기관 : 보험계약 인수여부 결정을 위한 판단, 주행거리
            확인, 보험요율 산출 정보 확인
            <br />
            - 금융거래기관 : 예금주(카드소유주) 본인확인
            <br />
            - 본인인증기관 : 실명인증, 본인인증
            <br />- 코리안크레딧뷰로 : 보험계약 인수여부 결정을 위한 판단
          </p>
          <p>
            3. 조회 동의의 효력기간
            <br />- 동의일로부터 보험계약의 청약시까지(최대 3개월)
          </p>
          <p>
            4. 조회 항목
            <br />
            ① 고유식별정보 : 주민등록번호, 외국인등록번호, 여권번호,
            운전면허번호
            <br />
            ② 민감정보 : 피보험자의 질병·상해에 관한 정보(진료기록, 상병명,
            기왕증 등) 교통법규위반정보(자동차보험에 한함)
            <br />
            ③ 개인(신용정보)
            <br />
            - 일반개인정보 : 성명, CI, 국내거소신고번호, 주행거리정보, 의무보험
            가입대상 여부·일련번호, 보험요율 산출 정보, 주행거리정보
            <br />
            - 신용거래정보 : 보험계약정보(상품종류, 보험가입금액
            등)·보험금정보(보험금 지급사유, 지급금액 등)
            <br />
            - 신용능력정보 : 소득, 신용등급
            <br />
            - 공공정보등 : 군운전경력정보*, 자동차등록관련정보(자동차보험에
            한함)
            <br />* 보험요율 산출기관이 행정정보공동이용센터를 통해
            병무청으로부터 제공받는 정보(단, 요율산출에 필요한 보험계약에 한함)
          </p>
          <hr className={styles.line} />

          {/* 세 번째 동의 섹션 */}
          <ConsentSection
            title="조회"
            sectionIndex={2}
            consentStates={consentStates}
            onSetConsent={setConsentState}
          />
        </div>
      </div>
      <button
        className={styles.consentButton}
        onClick={handleFloatingButtonClick}
        disabled={isButtonDisabled && currentSection === 3}
        style={{
          backgroundColor: isButtonDisabled && currentSection === 3
            ? '#cccccc'
            : currentSection === 3
              ? '#386937'
              : 'rgb(146, 168, 145)',
          cursor: isButtonDisabled && currentSection === 3 ? 'not-allowed' : 'pointer'
        }}
      >
        {sectionTexts[currentSection]}
      </button>
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

export default ConsentAgreement;
