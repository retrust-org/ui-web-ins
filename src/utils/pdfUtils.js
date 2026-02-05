// utils/pdfUtils.js
import { pdf } from "@react-pdf/renderer";
import { PLAN_TYPES } from "../data/ConfirmPlanData";
import InsurancePDFTemplate from "../apps/trip/domestic/upload/InsurancePDFTemplate";

// 개별 플랜 PDF Blob 생성 함수
export const generatePlanPDF = async (planType, props) => {
  try {
    if (!props.priceData || !props.priceData[planType]) {
      throw new Error(`No price data available for plan type: ${planType}`);
    }

    const blob = await pdf(
      <InsurancePDFTemplate
        planType={planType}
        planData={props.priceData[planType]}
        startDate={props.startDate}
        endDate={props.endDate}
        selectedCountry={props.selectedCountry}
        koreanName={props.koreanName}
        {...(props.isOverseas && { englishName: props.englishName })} // overseas에서만 영문 이름 전달
        email={props.email}
        phoneNumber={props.phoneNumber}
        companions={props.companions} // 추가된 부분
      />
    ).toBlob();

    return blob;
  } catch (error) {
    console.error(`PDF generation error for ${planType}:`, error);
    throw error;
  }
};

// 모든 플랜의 PDF 생성
export const generateAllPlanPDFs = async (props) => {
  const planPDFs = {};
  // overseas와 domestic에 따라 다른 플랜 목록 사용
  const planTypes = props.isOverseas 
    ? ["RECOMMEND", "PREMIUM", "BASIC", "LITE"]
    : ["PREMIUM", "BASIC", "LITE", "ACTIVITY"];

  for (const planType of planTypes) {
    try {
      const blob = await generatePlanPDF(planType, props);
      planPDFs[planType] = blob;
    } catch (error) {
      console.error(`Failed to generate PDF for ${planType}:`, error);
    }
  }

  return planPDFs;
};

// PDF 다운로드 함수
export const downloadPDF = (blob, planType) => {
  if (!blob) {
    console.error("[PDF Download] No PDF blob available");
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `인슈어트러스트_${
    PLAN_TYPES[planType]
  }_여행자보험_견적서_${new Date().getTime()}.pdf`;

  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
};
