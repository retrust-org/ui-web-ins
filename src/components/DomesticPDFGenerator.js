import React, { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import InsurancePDFTemplate from "../apps/trip/domestic/upload/InsurancePDFTemplate";

const DomesticPDFGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);

  const hardcodedData = {
    "insBgnDt": "20250827",
    "insEdDt": "20250827", 
    "productCd": "15920",
    "natlCd": "KR00",
    "inspeCnt": "20",
    "inspeInfos": [
      {"inspeNm": "계약자", "inspeBdt": "19670317", "gndrCd": "2"},
      {"inspeNm": "동반1", "inspeBdt": "19650505", "gndrCd": "2"},
      {"inspeNm": "동반2", "inspeBdt": "19650404", "gndrCd": "2"},
      {"inspeNm": "동반3", "inspeBdt": "19701003", "gndrCd": "2"},
      {"inspeNm": "동반4", "inspeBdt": "19721015", "gndrCd": "2"},
      {"inspeNm": "동반5", "inspeBdt": "19730613", "gndrCd": "2"},
      {"inspeNm": "동반6", "inspeBdt": "19690210", "gndrCd": "2"},
      {"inspeNm": "동반7", "inspeBdt": "19661103", "gndrCd": "2"},
      {"inspeNm": "동반8", "inspeBdt": "19680517", "gndrCd": "2"},
      {"inspeNm": "동반9", "inspeBdt": "19570815", "gndrCd": "2"},
      {"inspeNm": "동반10", "inspeBdt": "19580919", "gndrCd": "2"},
      {"inspeNm": "동반11", "inspeBdt": "19670215", "gndrCd": "2"},
      {"inspeNm": "동반12", "inspeBdt": "19700218", "gndrCd": "2"},
      {"inspeNm": "동반13", "inspeBdt": "19700322", "gndrCd": "2"},
      {"inspeNm": "동반14", "inspeBdt": "19690505", "gndrCd": "2"},
      {"inspeNm": "동반15", "inspeBdt": "19670215", "gndrCd": "2"},
      {"inspeNm": "동반16", "inspeBdt": "19621125", "gndrCd": "2"},
      {"inspeNm": "동반17", "inspeBdt": "19681028", "gndrCd": "2"},
      {"inspeNm": "동반18", "inspeBdt": "19610525", "gndrCd": "2"},
      {"inspeNm": "동반19", "inspeBdt": "19660325", "gndrCd": "2"}
    ]
  };

  const handleGeneratePDF = async () => {
    setIsLoading(true);
    console.log("Starting PDF generation...");
    
    try {
      console.log("Fetching data from API...");
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

      const apiData = await response.json();
      console.log("API Response received:", apiData);

      if (!apiData.BASIC) {
        throw new Error("BASIC 플랜 데이터가 없습니다.");
      }

      console.log("Creating companions data...");
      const companions = hardcodedData.inspeInfos.slice(1).map((person) => ({
        koreanName: person.inspeNm,
        dateOfBirth: person.inspeBdt,
        gender: person.gndrCd
      }));

      console.log("Generating PDF blob...");
      const pdfBlob = await pdf(
        <InsurancePDFTemplate
          planType="BASIC"
          planData={apiData.BASIC}
          startDate={hardcodedData.insBgnDt}
          endDate={hardcodedData.insEdDt}
          selectedCountry={{ korNatlNm: "대한민국" }}
          koreanName="계약자"
          email="test@example.com"
          phoneNumber="010-0000-0000"
          companions={companions}
        />
      ).toBlob();

      console.log("PDF blob created, downloading...");
      if (pdfBlob) {
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `국내여행보험_BASIC_견적서_${new Date().getTime()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log("PDF download completed");
      }

    } catch (error) {
      console.error("PDF 생성 실패:", error);
      alert(`오류: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleGeneratePDF}
      disabled={isLoading}
      style={{ 
        padding: '10px 20px', 
        marginBottom: '20px',
        backgroundColor: isLoading ? '#ccc' : '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        fontSize: '14px'
      }}
    >
      {isLoading ? '국내여행 PDF 생성중...' : '국내여행 BASIC PDF 생성'}
    </button>
  );
};

export default DomesticPDFGenerator;