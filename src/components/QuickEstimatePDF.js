import React, { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import InsurancePDFTemplate from "../apps/trip/domestic/upload/InsurancePDFTemplate";

const QuickEstimatePDF = () => {
  const [isLoading, setIsLoading] = useState(false);

  const contractorInfo = {
    koreanName: "김갑선",
    englishName: "김갑선", 
    email: "ymswc@hanmail.net",
    phoneNumber: "010-3874-6611",
    gender: "2",
    dateOfBirth: "19670317"
  };

  const companions = [
    {"koreanName": "김남식", "englishName": "김남식", "email": "ymswc@hanmail.net", "phoneNumber": "010-3382-2963", "gender": "2", "dateOfBirth": "19650505"},
    {"koreanName": "김명화", "englishName": "김명화", "email": "ymswc@hanmail.net", "phoneNumber": "010-5213-4060", "gender": "2", "dateOfBirth": "19650404"},
    {"koreanName": "김미경", "englishName": "김미경", "email": "ymswc@hanmail.net", "phoneNumber": "010-6411-3521", "gender": "2", "dateOfBirth": "19701003"},
    {"koreanName": "김순자", "englishName": "김순자", "email": "ymswc@hanmail.net", "phoneNumber": "010-7712-3295", "gender": "2", "dateOfBirth": "19721015"},
    {"koreanName": "박기영", "englishName": "박기영", "email": "ymswc@hanmail.net", "phoneNumber": "010-3786-6709", "gender": "2", "dateOfBirth": "19730613"},
    {"koreanName": "박은경", "englishName": "박은경", "email": "ymswc@hanmail.net", "phoneNumber": "010-3908-8925", "gender": "2", "dateOfBirth": "19690210"},
    {"koreanName": "서영미", "englishName": "서영미", "email": "ymswc@hanmail.net", "phoneNumber": "010-3451-1065", "gender": "2", "dateOfBirth": "19661103"},
    {"koreanName": "신금숙", "englishName": "신금숙", "email": "ymswc@hanmail.net", "phoneNumber": "010-2885-6170", "gender": "2", "dateOfBirth": "19680517"},
    {"koreanName": "윤종옥", "englishName": "윤종옥", "email": "ymswc@hanmail.net", "phoneNumber": "010-2405-1203", "gender": "2", "dateOfBirth": "19570815"},
    {"koreanName": "정명규", "englishName": "정명규", "email": "ymswc@hanmail.net", "phoneNumber": "010-4946-9668", "gender": "2", "dateOfBirth": "19580919"},
    {"koreanName": "정회인", "englishName": "정회인", "email": "ymswc@hanmail.net", "phoneNumber": "010-6425-4354", "gender": "2", "dateOfBirth": "19670215"},
    {"koreanName": "황미순", "englishName": "황미순", "email": "ymswc@hanmail.net", "phoneNumber": "010-9329-9676", "gender": "2", "dateOfBirth": "19700218"},
    {"koreanName": "김경남", "englishName": "김경남", "email": "ymswc@hanmail.net", "phoneNumber": "010-2144-2882", "gender": "2", "dateOfBirth": "19700322"},
    {"koreanName": "최선영", "englishName": "최선영", "email": "ymswc@hanmail.net", "phoneNumber": "010-3476-1010", "gender": "2", "dateOfBirth": "19690505"},
    {"koreanName": "정경남", "englishName": "정경남", "email": "ymswc@hanmail.net", "phoneNumber": "010-2962-8562", "gender": "2", "dateOfBirth": "19670215"},
    {"koreanName": "김영자", "englishName": "김영자", "email": "ymswc@hanmail.net", "phoneNumber": "010-2248-5592", "gender": "2", "dateOfBirth": "19621125"},
    {"koreanName": "정선예", "englishName": "정선예", "email": "ymswc@hanmail.net", "phoneNumber": "010-5016-6206", "gender": "2", "dateOfBirth": "19681028"},
    {"koreanName": "진경숙", "englishName": "진경숙", "email": "ymswc@hanmail.net", "phoneNumber": "010-3116-8211", "gender": "2", "dateOfBirth": "19610525"},
    {"koreanName": "이현순", "englishName": "이현순", "email": "ymswc@hanmail.net", "phoneNumber": "010-3116-2672", "gender": "2", "dateOfBirth": "19660325"}
  ];

  const hardcodedData = {
    "insBgnDt": "20250827",
    "insEdDt": "20250827", 
    "productCd": "15920",
    "natlCd": "KR00",
    "inspeCnt": "20",
    "inspeInfos": [
      {"inspeNm": contractorInfo.koreanName, "inspeBdt": contractorInfo.dateOfBirth, "gndrCd": contractorInfo.gender},
      ...companions.map(comp => ({
        "inspeNm": comp.koreanName,
        "inspeBdt": comp.dateOfBirth, 
        "gndrCd": comp.gender
      }))
    ]
  };

  const downloadPDF = (blob, planType) => {
    if (!blob) {
      console.error("[PDF Download] No PDF blob available");
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `인슈어트러스트_${planType}_국내여행보험_견적서_${new Date().getTime()}.pdf`;

    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const generatePDF = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/trip-api/api/v3/trip/calculate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(hardcodedData),
        }
      );

      if (!response.ok) {
        throw new Error(`API 오류 (${response.status})`);
      }

      const priceData = await response.json();
      console.log("API Response:", priceData);

      // BASIC 플랜만 추출해서 PDF 생성
      if (priceData.BASIC) {
        console.log("Using BASIC plan");
        
        // 국내여행보험 전용 PDF 직접 생성
        const blob = await pdf(
          <InsurancePDFTemplate
            planType="BASIC"
            planData={priceData.BASIC}
            startDate={hardcodedData.insBgnDt}
            endDate={hardcodedData.insEdDt}
            selectedCountry={{ korNatlNm: "국내전역" }}
            koreanName={contractorInfo.koreanName}
            email={contractorInfo.email}
            phoneNumber={contractorInfo.phoneNumber}
            companions={companions}
          />
        ).toBlob();

        if (blob) {
          downloadPDF(blob, "BASIC");
        }
      } else {
        console.error("BASIC plan not available in API response");
        alert("BASIC 플랜 데이터가 없습니다.");
      }

    } catch (error) {
      console.error("PDF 생성 오류:", error);
      alert(`PDF 생성 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={generatePDF}
      disabled={isLoading}
      style={{ 
        padding: '10px 20px', 
        marginBottom: '20px',
        backgroundColor: isLoading ? '#ccc' : '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: isLoading ? 'not-allowed' : 'pointer'
      }}
    >
      {isLoading ? '견적서 생성중...' : '빠른 PDF 견적서 생성'}
    </button>
  );
};

export default QuickEstimatePDF;