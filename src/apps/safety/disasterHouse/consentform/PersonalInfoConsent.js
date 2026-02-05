import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../../../css/disasterHouse/consentAgreement.module.css";
import buttonChk from "../../../../assets/buttonChk.svg";
import buttonActiveChk from "../../../../assets/safety-activeChk.svg";
import DisasterHeader from "../../../../components/headers/DisasterHeader";
import Loading from '../../../../components/loadings/Loading';
import ErrorModal from '../../../../components/modals/ErrorModal';
import { useSession } from "../../../../context/SessionContext";
import { recordConsent, ConsentError, getErrorMessage } from "../../services/consentService";

// 동의 항목별 templateId 매핑 (수집이용: 1-3, 제공: 4-6, 조회: 7-9)
const TEMPLATE_IDS = {
  0: 201, // 수집이용 - 고유식별정보
  1: 202, // 수집이용 - 민감정보
  2: 203, // 수집이용 - 개인신용정보
  3: 204, // 제공 - 고유식별정보
  4: 205, // 제공 - 민감정보
  5: 206, // 제공 - 개인신용정보
  6: 207, // 조회 - 고유식별정보
  7: 208, // 조회 - 민감정보
  8: 209, // 조회 - 개인신용정보
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

function PersonalInfoConsent() {
    const navigate = useNavigate();
    const { sessionToken, clearSession } = useSession();

    // 9개 동의 항목 상태 관리 (0: 선택안함, 1: 동의, -1: 미동의)
    const [consentStates, setConsentStates] = useState(new Array(9).fill(0));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // 세션 관련 에러인지 확인
    const isSessionError = (errorMessage) => {
        const sessionErrorPatterns = [
            '세션', 'session', 'SESSION_EXPIRED', 'MISSING_SESSION_TOKEN'
        ];
        return sessionErrorPatterns.some(pattern =>
            errorMessage?.toLowerCase().includes(pattern.toLowerCase())
        );
    };

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
                setError(getErrorMessage(err.code, err.reason));
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
            navigate('/signupChkConsent');
        }
    };

    // 에러 모달 닫기
    const handleCloseError = () => {
        // 세션 관련 에러면 /price로 리다이렉트
        if (isSessionError(error)) {
            clearSession();
            navigate('/price');
        }
        setError(null);
    };

    return (
        <>
            <DisasterHeader title="개인(신용)정보 처리 상세 동의서" backPath="/agreement" />
            <div className={styles.container}>
                <div className={styles.Wrap}>
                <div className={styles.mainTitle}>
                    <h1 className={styles.highlightText}>
                        계약 체결·이행을 위한
                    </h1>
                    <h1 className={styles.highlightText}>
                        개인(신용)정보 처리 상세 동의서
                    </h1>
                </div>

                {/* 인트로 섹션 */}
                <div className={styles.section}>
                    <p>
                        귀하는 개인(신용)정보의 수집·이용 및 조회, 제공에 관한 동의를 거부하실 수 있으며,
                        개인의 신용도 등을 평가하기 위한 목적 이외의 개인(신용)정보 제공 동의는 철회할 수 있습니다.
                    </p>

                    <p>
                        다만, 본 동의는 '보험계약 인수심사·체결·이행·유지·관리'를 위해 필수적인 사항이므로
                        동의를 거부하시는 경우 관련 업무 수행이 불가능합니다. 또한 본 동의서에 의한
                        개인(신용)정보 조회는 귀하의 개인신용평점에 영향을 주지 않습니다.
                    </p>
                </div>

                {/* 수집·이용에 관한 사항 */}
                <div className={styles.section}>
                    <h2>수집·이용에 관한 사항</h2>

                    <p>
                        1. 수집·이용목적
                        <br />
                        - 보험계약의 인수심사·체결·이행·유지·관리(부활 및 갱신 포함)
                        <br />
                        - 순보험요율의 산출·검증, 민원처리 및 분쟁 대응, 금융거래 관련 업무(금융거래신청, 자동이체, 휴대폰소액결제 등)
                        <br />
                        - 보험모집질서의 유지(공정경쟁질서유지에 관한 협정업무 포함)
                        <br />
                        - 가입한 보험계약 상담(당사 및 당사 설계사에 한함)
                        <br />
                        - 보험계약 및 보험금청구에 이해관계자가 있는 자에 대한 법규/협약 및 계약상 의무이행(보험가입 의무대상 확인, 보험금 지급·심사, 보험사고·보험사기 조사, 잔존물대위, 구상업무 등 포함)
                        <br />
                        - 다중이용업소 화재배상책임보험 가입대상 확인
                    </p>

                    <p>
                        2. 보유 및 이용기간
                        <br />
                        - 동의일로부터 거래종료 후 5년까지 (단, 거래종료 후 5년이 경과한 후에는 보험금지급,
                        금융사고조사, 보험사기 방지·적발, 민원처리, 법령상 의무이행을 위한 경우에 한하여 보유·이용하며, 별도보관)
                    </p>
                    <p>
                        위 보유기간에서의 거래종료일이란 "①보험계약만기, 해지, 취소, 철회일 또는 소멸일,
                        ②보험금 청구권 소멸시효 완성일(상법제662조), ③채권·채무관계 소멸일 중 가장 나중에
                        도래한 사유를 기준으로 판단한 날"을 말한다.
                    </p>

                    <p>
                        3. 수집·이용 항목
                        <br />
                        ① 고유식별정보 : 주민등록번호, 외국인등록번호, 여권번호, 운전면허번호
                        <br />
                        ② 민감정보 : 피보험자의 질병·상해에 관한 정보(진료기록, 상병명, 기왕증 등)
                        <br />
                        ③ 개인(신용정보)
                        <br />
                        - 신용거래정보 : 금융거래 업무관련 정보(납입계좌정보 등), 보험계약정보(상품종류, 기간, 보험가입금액 등),
                        보험금정보(보험금 지급사유, 지급금액 등), 손해사정 업무 수행과 관련하여 취득한 정보(경찰, 공공·국가기관,
                        의료기관 등으로부터 본인의 위임을 받아 취득한 각종 조사서, 판결문, 증명서, 진료기록 등),
                        계약 전 알릴 의무사항(취미등), 다중이용업소정보, 통신사정보
                        <br />
                        - 신용능력정보 : 소득 및 신용도 판단정보
                    </p>
                    <hr className={styles.line} />

                    {/* 첫 번째 동의 섹션 */}
                    <ConsentSection
                        title="수집·이용"
                        sectionIndex={0}
                        consentStates={consentStates}
                        onSetConsent={setConsentState}
                    />
                </div>
                <hr className={styles.division} />

                {/* 제공에 관한 사항 섹션 */}
                <div className={styles.section}>
                    <h2>제공에 관한 사항</h2>
                    <p>
                        1. 제공받는 자
                        <br />- 보험모집업무/설계지원업무를위탁받은자(대리점,설계사등),국내재보험사,종합신용정보집중기관,생명·손해보험협회,보험요율산출기관,금융거래기관,코리안크레딧뷰로,본인인증기관,의무보험관계법령의소관부처및그상·하급정부조직·공공기관
                    </p>
                    <p>
                        2. 제공받는자의 이용목적
                        <br />
                        - 보험계약상담(보장분석포함),가입설계,가입설계지원
                        <br />
                        - 국내재보험사:보험계약인수여부판단
                        <br />- 종합신용정보집중기관, 생명·손해보험협회,보험요율산출기관,금융거래기관,코리안크레딧뷰로,본인인증기관,의무보험관계법령의소관부처및그상·하급정부조직·공공기관:개인(신용)정보조회
                    </p>
                    <p>
                        3. 보유 및 이용기간
                        <br />
                        - 동의일로부터3개월까지
                        <br />※ 외국 재보험사의 국내지점이 재보험계약 가입 판단 지원, 보험계약 공동인수 지원 업무를 위탁하기 위한 경우 별도의 동의 없이 외국 소재 본점에 귀하의 정보를 이전할 수 있습니다.
                    </p>
                    <p>
                        4. 제공 항목
                        <br />
                        ① 고유식별정보 : 주민등록번호, 외국인등록번호, 여권번호, 운전면허번호
                        <br />
                        ② 민감정보 : 피보험자의 질병·상해에 관한 정보(진료기록,상병명,기왕증,흡연여부등) 교통법규위반정보
                        <br />
                        ③ 개인(신용정보)
                        <br />
                        - 일반개인정보: 성명, 국내거소신고번호, 주소, 유·무선전화번호, 상호명, 업종명, 보험가입 의무대상 일련번호
                        <br />
                        - 신용거래정보: 보험계약정보(상품종류, 보험가입금 등)·보험금정보(보험금 지급사유, 지급금액 등) ·계약 전 알릴의무사항(취미등)
                        <br />※ 업무위탁을 목적으로 개인(신용)정보 처리하는 경우 별도의 동의없이 업무수탁자에게 귀하의 정보를 제공할 수있습니다. (홈페이지(www.meritzfire.com)에서확인가능)
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
                        - 종합신용정보집중기관, 생명·손해보험협회, 보험요율산출기관, 금융거래기관, 코리안크레딧뷰로, 소방청, 실명인증/본인인증기관(신용정보회사및통신사) 등
                    </p>
                    <p>
                        2. 조회 목적
                        <br />
                        - 종합신용정보집중기관 : 보험계약의 인수심사·체결·이행·유지·관리(부활 및 갱신 포함), 보험금 등 지급·심사, 보험사고·보험사기 조사, 가입한도 조회, 실손형 보험 중복확인
                        <br />
                        - 생명·손해보험협회, 보험요율산출기관 : 보험가입 의무대상확인, 보험금 청구서류 대행서비스
                        <br />
                        - 소방청 : 다중이용업소 화재배상책임보험 가입대상 확인
                        <br />
                        - 금융거래기관,인증기관 : 예금주·카드소유주 확인, 세금우대저축사항 확인, 실명인증 및 본인인증
                        <br />
                        - 코리아크레딧뷰로 : 보험계약의 인수심사
                    </p>
                    <p>
                        3. 조회 동의의 효력기간
                        <br />
                        - [당사]의 조회결과 귀하와의 보험거래가 개시되는 경우 해당 보험거래종료 후 5년까지 동의의 효력이지속됩니다. 다만, [당사]의 조회결과 귀하가 신청한 보험 거래의 설정이 거절된 경우에는 그 시점부터 동의의 효력은 소멸합니다.
                    </p>
                    <p>
                        4. 조회 항목
                        <br />
                        ① 고유식별정보 : 주민등록번호, 외국인등록번호, 여권번호, 운전면허번호
                        <br />
                        ② 민감정보 : 피보험자의 질병ㆍ상해에 관한 정보(진료기록, 상병명, 기왕증 등)
                        <br />
                        ③ 개인(신용정보)
                        <br />
                        - 일반개인정보 : 성명, 국내거소신고번호
                        <br />
                        - 신용거래정보 : 보험계약정보(상품종류, 기간, 보험가입금액 등), 보험금정보(보험금 지급사유, 지급금액 등) 보험가입 의무대상 확인을 위한 정보, 실명인증/본인인증을 위한 정보, 세금우대저축 가입정보, 본인계좌(카드) 확인정보, 다중이용업소정보
                        <br />
                        - 신용능력정보 : 소득 및 신용도 판단정보
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

export default PersonalInfoConsent;
