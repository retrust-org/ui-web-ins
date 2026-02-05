import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../../../css/disasterSafeguard/consentAgreement.module.css";
import SafetyButton from "../../../../components/buttons/SafetyButton"
import { useDisasterAuth } from "../../../../components/auth/DisasterAuth";
import { useDisasterInsurance } from "../../../../context/DisasterInsuranceContext";
import { useSession } from "../../../../context/SessionContext";
import DisasterHeader from "../../../../components/headers/DisasterHeader";
import Loading from "../../../../components/loadings/Loading";
import ErrorModal from "../../../../components/modals/ErrorModal";
import { recordConsent, ConsentError, isSessionError, getErrorMessage } from "../../services/consentService";

// 가입 전 확인사항 템플릿 ID
const TEMPLATE_ID = 300;

function SignupChkConsent() {
  const navigate = useNavigate();
  const { updateAuthData } = useDisasterInsurance();
  const { sessionToken, setSessionToken, clearSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthError, setIsAuthError] = useState(false);
  const [isConsentError, setIsConsentError] = useState(false);

  // 본인인증 에러 시 처리
  const handleAuthError = (error) => {
    console.log('==== 본인인증 에러 ====', error);
    setIsAuthError(true);

    // error 객체 구조에 따라 메시지 설정
    const errorMessage = error?.message || error?.error?.message || '본인인증에 실패했습니다.';
    setError(errorMessage);
  };

  // 본인인증 성공 시 처리 (V3 API: sessionToken 갱신)
  const handleAuthSuccess = async (result) => {
    console.log("==== 본인인증 완료 ====");
    console.log("전체 result 객체:", result);
    console.log("athNo (인증번호):", result.athNo);
    console.log("name (이름):", result.name);
    console.log("birthdate (생년월일):", result.birthdate);
    console.log("mobileno (휴대폰번호):", result.mobileno);
    console.log("sessionToken:", result.token ? "있음" : "없음");
    console.log("====================");

    // V3 API: 갱신된 sessionToken 저장 (authenticated: true)
    if (result.token) {
      // 만료 시간은 30분 후로 설정 (서버와 동일)
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      setSessionToken(result.token, expiresAt);
    }

    // Context에 인증 데이터 저장 (사용자 정보)
    updateAuthData({
      athNo: result.athNo,
      name: result.name,
      birthdate: result.birthdate,
      mobileno: result.mobileno
    });

    // 다음 페이지로 이동
    navigate('/userInfo');
  };

  const { openAuthPopup } = useDisasterAuth(handleAuthSuccess, handleAuthError);

  // 본인인증 팝업 오픈
  const handleNext = async () => {
    if (!sessionToken) {
      setError('세션 정보가 없습니다. 보험료 조회부터 다시 진행해 주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // V3 API: 가입 전 확인사항 동의 기록 (본인인증 요청 전 필수)
      await recordConsent(sessionToken, {
        templateId: TEMPLATE_ID,
        consentVersion: '1.0',
        isAgreed: true
      });
      console.log('가입 전 확인사항 동의 기록 완료 (template:', TEMPLATE_ID, ')');

      // 동의 완료 후 본인인증 팝업 오픈
      openAuthPopup(sessionToken, 'disaster-business');
    } catch (err) {
      console.error('동의 기록 실패:', err);
      setIsConsentError(true);

      // ConsentError인 경우 사용자 친화적 메시지 사용
      if (err instanceof ConsentError) {
        const userMessage = getErrorMessage(err.code, err.reason);

        // 세션 관련 에러인 경우 특별 처리
        if (isSessionError(err.code)) {
          setError('동의 처리 중 세션이 만료되었네요.\n보험료 조회부터 다시 진행해 주세요.');
        } else {
          setError(userMessage);
        }
      } else {
        setError('동의 처리 중 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 에러 모달 닫기
  const handleCloseError = () => {
    setError(null);

    // 본인인증 에러 또는 동의처리 에러인 경우 세션 정리 후 /price로 이동
    if (isAuthError || isConsentError) {
      setIsAuthError(false);
      setIsConsentError(false);
      clearSession();
      navigate('/price');
    }
  };

  return (
    <>
      <DisasterHeader title="가입 전 확인사항" />
      <div className={styles.container}>
        <div className={styles.Wrap}>
        <div className={styles.mainTitle}>
          <h1 className={styles.highlightText}>
            가입 전 확인사항
          </h1>
        </div>

        {/* 첫 번째 섹션 */}
        <div className={styles.section}>
          <p>
            1. 본 풍수해·지진재해보험의 보험 시작일은 선택한 날의 16:00부터 시작됩니다.
          </p>
          <p>
            2. 이미 기상청 및 홍수통제소의 기상특보(주의보/경보) 또는 예비특보가 발표된 경우 보험가입이 제한됩니다.
          </p>
          <p>
            3. 보험료 지원을 위한 정부예산이 소진된 경우 가입이 제한됩니다.
          </p>
          <p>
            4. 기존 사고(풍수해, 지진재해 등)로 인해 파손된 경우, 수리 및 복구가 완료 후 보험가입이 가능합니다.
          </p>
          <p>
            5. 만약 중대한 고지사항들에 대하여 사실대로 알리지 않거나 사실과 다르게 알린 경우에는 보험가입이 거절될 수 있으며, 회사는 보험약관 제29조3항(계약의 해지)에 따라 이 보험계약을 해지할 수 있고, 이미 보험사고가 발생하였더라도 보험약관 제24조 5항에 따라 보험금 지급을 거절하는 등 보장이 제한될 수 있습니다.
          </p>
          <p>
            6. 보험계약자가 기존 보험계약을 해지하고, 새로운 보험계약을 체결할 경우 인수거절, 보험료 인상, 보장내용 축소 등 불이익이 생길 수 있습니다.
          </p>
        </div>

        {/* 두 번째 섹션 - 보험약관 내용 */}
        <div className={styles.section}>
          <p>
            <strong>가) 보상하는 손해</strong>
          </p>
          <p>
            ① 보험사는 이 약관에 따라 보험기간 중에 보험의 목적이 위치하고 있는 지역에 기상특보(주의보·경보) 또는 지진속보가 발표된 후 보험의 목적이 태풍, 호우, 홍수, 강풍, 풍랑, 해일, 대설, 지진, 지진재해(이하 ' 풍수해·지진재해'라 합니다)의 직접적인 결과로 입은 물리적인 손해를 보상하여 드립니다. 이때 기상청 및 홍수통제소 특보는 보험목적 소재지에 대한 발표시점을 기준으로 판단합니다. 단, 보험목적 소재지의 시군내에 기상관측소가 없는 경우는 보험목적물 소재 시군에서 가장 가까운 기상관측소에 나타난 측정자료로 판정합니다.
          </p>
          <p>
            ② '자연재난 구호 및 복구 비용 부담기준 등에 관한 규정' 제2조에서 정하고 있는 그 밖에 이에 준하는 자연현상(태풍, 호우, 홍수, 강풍, 풍랑, 해일, 대설에 한함)인 다음 각 호의 경우로 인하여 발생하는 손해에 대해서도 보상하여 드립니다.
            <br />
            ㄱ. 기상청이 기상 예비특보를 발표하는 경우
            <br />
            ㄴ. 기상특보 발표는 되지 않았으나 연접한 지역(시·군)에 기상특보 또는 지진속보가 발표되었고, 「자연재해대책법」 제 74조에 따라 지자체에서 '피해사실확인서'를 발급하여 실제 발생한 피해가 확인되는 경우
            <br />
            ㄷ. 기타 중앙 및 지역재난안전대책본부회의에서 재난으로 결정하는 경우
          </p>
          <p>
            ③ 자연재난 구호 및 복구 비용 부담기준 등에 관한 규정' 제3조, 제5조 및 제6조의 규정에 의하여 중앙재난안전대책본부장이 재해복구사업에 필요한 국고 또는 지방비 지원기준으로 인정한 1항의 재난 및 강풍에 준하는 다음 각 호의 손해에 대해서도 보상하여 드립니다.
            <br />
            ㄱ. 인접한 2동 이상의 보험대상시설물에 피해가 발생한 경우
            <br />
            ㄴ. 해당 시·군·구(자치구를 말한다)에서 5동 이상 또는 해당 시(광역시, 특별시를 말한다)·도에서 50동 이상의 보험대상시설물에 피해가 발생한 것으로 행정안전부의 확인이 있는 경우
          </p>
          <p>
            ④ 회사는 제1항 내지 제3항에서 보장하는 위험으로 인하여 손해가 발생한 경우 계약자 또는 피보험자가 지출한 아래의 비용을 추가로 지급합니다.
            <br />
            ㄱ. 잔존물 제거비용 : 사고현장에서의 잔존물의 해체비용, 청소비용 및 차에 싣는 비용. 다만, 제1항에서 보장하지 않는 위험으로 보험의 목적이 손해를 입거나 관계법령에 의하여 제거됨으로써 생긴 손해에 대하여는 보상하여 드리지 않습니다.
            <br />
            【잔존물】보험사고로 보험의 목적물이 없어지지 않고 남아 있는 것을 말합니다.
            <br />
            【청소비용】사고현장 및 인근 지역의 토양, 대기 및 수질 오염물질 제거비용과 차에 실은 후 폐기물 처리비용은 포함되지 않습니다.
            <br />
            ㄴ. 손해방지비용 : 손해의 방지 또는 경감을 위하여 지출한 필요 또는 유익한 비용
            <br />
            ㄷ. 대위권 보전비용 : 제3자로부터 손해의 배상을 받을 수 있는 경우에는 그 권리를 지키거나 행사하기 위하여 지출한 필요 또는 유익한 비용
            <br />
            ㄹ. 잔존물 보전비용 : 잔존물을 보전하기 위하여 지출한 필요 또는 유익한 비용. 다만, 실손보상 소상공인 풍수해·지진재해보험(VI)보통약관 제12조(잔존물)에 의해 회사가 잔존물을 취득한 경우에 한합니다.
            <br />
            ㅁ. 기타 협력비용 : 회사의 요구에 따르기 위하여 지출한 필요 또는 유익한 비용
          </p>

          <p>
            <strong>나) 보험금을 지급하지 아니하는 사유</strong>
          </p>
          <p>
            ① 계약자, 피보험자 또는 이들의 법정대리인의 고의 또는 중대한 과실
            <br />
            ② 풍수해·지진재해가 발생했을 때 생긴 도난 또는 분실로 생긴 손해
            <br />
            ③ 보험의 목적의 노후 및 하자로 생긴 손해
            <br />
            ④ 풍수해·지진재해로 생긴 화재, 폭발 손해. 단, 지진재해로 인해 발생한 화재손해는 보상하여 드립니다.
            <br />
            ⑤ 추위, 서리, 얼음, 우박으로 인한 손해
            <br />
            ⑥ 축대, 제방 등의 붕괴로 인한 손해, 단 붕괴의 직접적인 원인이 이 약관에 의하여 보상되는 사고일 때에는 보상
            <br />
            ⑦ 침식활동 및 지하수로 인한 손해
            <br />
            ⑧ 보험계약일 현재 이미 진행중인 태풍, 호우, 홍수, 강풍, 풍랑, 해일, 대설, 지진으로 인한 손해
            <br />
            ⑨ 전쟁, 내란, 폭동, 소요, 노동쟁의 등으로 인한 손해
            <br />
            ⑩ 풍수해·지진재해와 관계없이 댐 또는 제방이 터지거나 무너져 내린 손해
            <br />
            ⑪ 목적물의 기능 저하(노후·결함 등) 부분으로 바람, 비, 눈, 우박 또는 모래, 먼지가 들어옴으로써 생긴 손해. 그러나 보험의 목적인 건물이 풍수해 또는 지진재해로 직접 파손되어 보험의 목적에  생긴 손해는 보상하여 드립니다.
            <br />
            ⑫ 보험의 목적인 네온싸인장치에 전기적 사고로 생긴 손해 및 건식전구의 필라멘트에(만) 생긴 손해
            <br />
            [이미 진행 중] 보험기간중에 「보험의 목적」이 위치하고 있는 지역에 기상청(홍수통제소 포함) 기상특보(주의보,경보) 또는 예비특보 발령시점을 기준으로 합니다.
            <br />
            * 상기의 보험금을 지급하지 않는 사유는 약관에 기초하여 안내자료로 요약한 것으로 반드시 약관을 참조하시기 바랍니다.
          </p>

          <p>
            <strong>다) 상품의 특이사항</strong>
          </p>
          <p>
            ① 이상품은 소멸성 순수보장성보험으로 만기시 환급금이 없습니다.
            <br />
            ② 이 상품의 보험기간은 1년을 원칙으로 하되 1년 이상 3년 이하의 장기계약 또는 1년 미만의 단기계약을 체결할 수 있습니다.
            <br />
            ③ 이 상품의 보험료 납입주기는 일시납을 원칙으로 합니다.
          </p>

          <p>
            <strong>라) 배당여부</strong>
          </p>
          <p>
            이 계약은 순수보장형 무배당 상품으로 배당하지 않습니다.
          </p>

          <p>
            <strong>마) 청약시 주의 사항</strong>
          </p>
          <p>
            ① 보험계약 청약서에 인쇄된 내용을 보험계약자 본인이 직접 확인 하신 후 자필로 서명하셔야 합니다.
            <br />
            ② 회사는 계약을 체결할 때 계약자에게 보험약관을 드리고 그 약관의 중요한 내용을 설명하여 드립니다. 회사가 제공될 약관 및 계약자 보관용 청약서를 청약 시 계약자에게 전달하지 않거나 약관의 중요한 내용을 설명하지 않은 때 또는 계약체결 시 계약자가 청약서에 자필서명을 하지 않은 때에는 계약자는 계약이 성립한 날부터 3개월 이내에 계약을 취소할 수 있습니다.
            <br />
            * 계약을 체결한 경우 약관과 함께 청약서 부본을 꼭 보관하십시오.
          </p>

          <p>
            <strong>바) 계약 전 알릴의무</strong>
          </p>
          <p>
            계약자 또는 피보험자는 청약 시 청약서에 질문한 사항에 대하여 알고 있는 사실을 반드시 사실대로 알려야 합니다 만일, 고의 또는 중대한 과실로 중요한 사항에 대하여 사실과 다르게 알린 경우, 보험사는 보험계약자 또는 피보험자의 의사와 관계없이 계약을 해지하거나 보장을 제한할 수 있습니다.
          </p>

          <p>
            <strong>사) 계약 후 알릴의무</strong>
          </p>
          <p>
            계약을 맺은 후 보험의 목적에 아래와 같은 사실이 생긴 경우에는 계약자나 피보험자는 지체 없이 서면으로 회사에 알리고 보험증권에 확인을 받아야 합니다.
            <br />
            ① 이 계약에서 보장하는 위험과 동일한 위험을 보장하는 계약을 다른 보험자와 체결하고자 할 때 또는 이와 같은 계약이 있음을 알았을 때
            <br />
            ② 보험의 목적을 양도할 때
            <br />
            ③ 보험의 목적의 구조를 변경, 개축, 증축할 때
            <br />
            ④ 보험의 목적을 다른 곳으로 옮길 때
            <br />
            ⑤ 위험이 뚜렷이 변경되거나 변경되었음을 알았을 때
          </p>

          <p>
            <strong>아) 청약철회 및 품질보증제도</strong>
          </p>
          <p>
            ① 청약철회
            <br />
            일반금융소비자인 계약자는 「금융소비자 보호에 관한 법률」 제 46조, 동법 시행령 제37조, 동법 감독규정 제 30조에서 정하는 바에 따라 보험증권을 받은 날부터 15일 이내(청약을 한 날 부터 30일 이내(65세 이상 계약자가 전화를 이용하여 계약을 체결한 경우 청약을 한 날부터 45일 이내)에 한함에 그 청약을 철회할 수 있으며, 이 경우 철회를 접수한 날부터 3영업일 이내에 보험료를 돌려드립니다. 다만, 진단계약(계약을 체결하기 전에 일반금융 소비자의 건강상태 진단을 지원하는 상품), 보장기간이 90일 이내인 계약, 청약의 철회를 위해 제3자의 동의가 필요한 보증보험, 법률에 따라 가입의무가 부과되고 그 해제· 해지도 해당 법률에 따라 가능한 보험(다만, 계약자가 동종의 다른 보험에 가입한 경우는 제외), 「자동차 손해배상 보장법」에 따른 책임보험(다만, 계약자가 동종의 다른 책임보험에 가입한 경우는 제외) 또는 전문금융소비자가 체결한 계약은 청약을 철회할 수 없습니다. 청약철회 기간내에 청약철회를 하실 경우 납입한 보험료 전액을 돌려받으실 수 있습니다.
            <br />
            [일반금융소비자] : 전문금융소비자가 아닌 금융소비자를 말합니다.
            <br />
            [전문금융소비자] : 금융상품에 관한 전문성, 자산규모 등에 비추어 금융상품 계약에 따른 위험감수능력이 있는 금융소비자로서, 구체적인 범위는 「금융소비자보호에 관한 법률」 제2조(정의) 제9호에서 정하는 바에 따릅니다.
            <br />
            ② 품질보증제도
            <br />
            회사가 약관 및 계약자 보관용 청약서를 청약할 계약자에게 전달하지 않거나 약관의 중요한 내용을 설명하지 않은 때 또는 계약을 체결할 때 계약자가 청약서에 자필서명(날인(도장을 찍음) 및 전자서명법 제2조 제2호에 따른 전자서명을 포함합니다)을 하지 않을 때에는 계약자는 계약이 성립한 날부터 3개월 이내에 계약을 취소할 수 있습니다. 이 경우에 회사는 이미 납입한 보험료를 계약자에게 돌려드리며, 보험료를 받은 기간에 대하여 보험개발원이 공시하는 보험계약대출이율을 연단위 복리로 계산한 금액을 더하여 지급합니다.
          </p>

          <p>
            <strong>자) 청약철회 절차 및 방법</strong>
          </p>
          <p>
            청약철회를 원하시는 경우에는 청약서의 청약철회란을 작성하신 후 ① 해당보험사로 직접 우편송부하시거나, ② 가까운 해당보험사 영업점 방문 또는 해당보험사 콜센터로 신청하실 수 있으며, ③ 해당보험사 홈페이지에서도 공동인증서를 통해 청약을 철회할 수 있습니다. 청약철회 신청이 접수된 이후에는 보험금 지급사유가 발생하여도 보장하지 않습니다.
          </p>

          <p>
            <strong>차) 보험금 청구 및 절차</strong>
          </p>
          <p>
            보험사고 발생시에는 그 사실을 즉시 해당 보험사로 알려주시고, 사고증명서, 진단서 등의 보험금 청구서류를 제출해 주시면 신속하게 보상해 드립니다.
          </p>

          <p>
            <strong>카) 상담 및 보험분쟁조정 안내</strong>
          </p>
          <p>
            가입하신 보험에 관해 상담이 필요하시거나 불만사항이 있으실 때에는 먼저 해당 보험사로 연락주시면 신속하게 해결하실 수 있습니다. 또한 처리결과에 이의가 있을때에는 금융감독원에 민원 또는 분쟁조정을 신청하실 수 있습니다.
            <br />
            ① 보험사 상담전화 및 주소
            <br />
            - 메리츠화재해상보험 1566-7711 서울특별시 강남구 강남대로 382 메리츠타워
            <br />
            - DB손해보험 1588-0100 서울특별시 강남구 테헤란로 432 DB금융센터
            <br />
            ② 손해보험협회상담전화 : 02-3702-8500 서울특별시 종로구 종로5길 68, 6층(수송동,코리안리빌딩)
            <br />
            ③ 한국소비자원상담전화 : 국번없이 1372 충청북도 음성군 맹동면 용두로 54
            <br />
            ④ 금융감독원상담전화 : 국번없이 1332 서울특별시 영등포구 여의대로 38
          </p>

          <p>
            <strong>타) 예금자보호제도</strong>
          </p>
          <p>
            이 보험계약은 예금자보호법에 따라 해약환급금(또는 만기 시 보험금)에 기타지급금을 합한 금액이 1인당 "1억원까지"(본 보험회사의 타 보호상품과 합산) 보호됩니다. 이와 별도로 본 보험회사 보호상품의 사고보험금을 합산한 금액이 1인당 "1억원까지" 보호됩니다. 다만, 보험계약자 및 보험료납부자가 법인인 보험계약의 경우에는 보호되지 않습니다.
          </p>

          <p>
            <strong>파) 모집질서확립 및 신고센터 안내</strong>
          </p>
          <p>
            ① 보험계약과 관련한 보험모집질서 문란 행위는 보험업법에 의해 처벌받을 수 있습니다.
            <br />
            ② 금융감독원 모집질서 위반행위 신고센터 전화 국번없이 1332 / 인터넷 : http://www.fss.or.kr
            <br />
            ③ 사고접수, 보험처리 등 보험계약관련 문의(메리츠화재해상보험) 전화 : 1566-7711 인터넷 : https://www.meritzfire.com
          </p>

          <p>
            <strong>하) 금융감독원 보험범죄 신고센터</strong>
          </p>
          <p>
            보험범죄는 보험사기방지 특별법 제8조(보험사기죄)에 의거하여 10년 이하의 징역이나 5천만원 이하의 벌금에 처해지며 보험범죄를 교사한 경우에도 동일한 처벌을 받을 수 있습니다. 전화 : 국번없이 1332 / 인터넷 : www.fss.or.kr 인터넷 금융감독원 홈페이지(www.fss.or.kr) 내 「보험범죄신고센터」 보험범죄신고센터(insucop.fss.or.kr)
          </p>

          <p>
            <strong>○ 모집종사자 관련 사항</strong> - 보험대리점 ㈜리트러스트는 메리츠화재해상보험주식회사의 전속 대리점이며, 보험계약 체결권한은 보험대리점에게 있지 않고, 보험사에 있습니다.
          </p>
          <p>
            <strong>○ 상품설명서 및 약관 참조</strong> - 보험계약을 체결하기 전에 상품설명서 및 약관을 읽어보시기 바랍니다.
          </p>
          <p>
            <strong>○ 상품내용에 대한 확인</strong> - 금융소비자는 보험설계사 등 모집종사자 및 보험회사로부터 해당 상품에 대해 충분한 설명을 받을 권리가 있으며, 그 설명을 이해한 후 거래하시기 바랍니다.
          </p>
          <p>
            <strong>○ 비용보험의 비례보상에 관한 사항</strong> - 이 계약에서 보장하는 위험과 같은 위험을 보장하는 다른 계약(공제계약 포함)이 있을 경우에는 각 계약에 대하여 다른 계약이 없는 것으로 하여 각각 산출한 보상 책임액의 합계액이 손해액을 초과할 때에는 이 계약에 의한 보상 책임액의 상기 합계액에 대한 비율에 따라 보상하여 드립니다.
          </p>

          <p>
            위 내용을 충분히 확인하였고, 이에 동의합니다.
          </p>
        </div>
      </div>
      <SafetyButton
        buttonText='본인인증 진행하기'
        onClick={handleNext}
      />
      </div>

      {/* 로딩 표시 */}
      {isLoading && <Loading />}

      {/* 에러 모달 */}
      {error && (
        <ErrorModal
          message={isAuthError ? "본인인증 오류" : "동의 처리 오류"}
          subMsg={error}
          onClose={handleCloseError}
        />
      )}
    </>
  );
}

export default SignupChkConsent;
    