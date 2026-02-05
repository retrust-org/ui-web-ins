import React from "react";
import { Document, Page, Text, View, Font } from "@react-pdf/renderer";
import NotoSansRegular from "../../../assets/fonts/NotoSansKR-Regular.ttf";
import NotoSansSemiBold from "../../../assets/fonts/NotoSansKR-SemiBold.ttf";
import NotoSansBold from "../../../assets/fonts/NotoSansKR-Bold.ttf";
import NotoSansMedium from "../../../assets/fonts/NotoSansKR-Medium.ttf";
import { formatKoreanDate } from "../../../utils/currentDate";
import { formatKoreanPriceSimple } from "../../../utils/formatPrice";
import { PLAN_TYPES } from "../../../data/ConfirmPlanData";
import { styles } from "./pdfStyles";

// 폰트 등록
Font.register({
  family: "Noto Sans KR",
  fonts: [
    { src: NotoSansRegular, fontWeight: 400, fontStyle: "normal" },
    { src: NotoSansMedium, fontWeight: 500, fontStyle: "normal" },
    { src: NotoSansSemiBold, fontWeight: 600, fontStyle: "normal" },
    { src: NotoSansBold, fontWeight: 700, fontStyle: "normal" },
  ],
});

const InsurancePDFTemplate = ({
  planType,
  planData,
  startDate,
  endDate,
  selectedCountry,
  koreanName,
  englishName,
  email,
  phoneNumber,
  companions,
}) => {
  const formatNumber = (number) =>
    new Intl.NumberFormat("ko-KR").format(number);

  const formatDate = formatKoreanDate;

  const formatAmount = (amount) => {
    if (!amount) return "0원";
    return `${formatKoreanPriceSimple(amount)}원`;
  };

  const displayCountry =
    typeof selectedCountry === "object"
      ? selectedCountry.korNatlNm || "미지정"
      : selectedCountry || "미지정";

  // 현재 플랜의 데이터만 사용
  const currentPlanData = {
    premium: planData.ttPrem,
    insuredPersons: planData.opapiGnrCoprCtrInspeInfCbcVo,
    planName: PLAN_TYPES[planType],
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.companyHeader}>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>인슈어트러스트</Text>
              <Text style={styles.companyContact}>
                부산시 남구 문현 금융로 40 BIFC 8층 2호
              </Text>
              <Text style={styles.companyContact}>Tel: 1566-3305</Text>
              <Text style={styles.companyContact}>
                (주)리트러스트 | 대표 장우석
              </Text>
            </View>
          </View>

          <Text style={styles.documentTitle}>단체 여행자보험 견적서</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoColumn}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>견적일자</Text>
                <Text style={styles.value}>
                  {new Date().toLocaleDateString("ko-KR")}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>여행기간</Text>
                <Text style={styles.value}>
                  {formatDate(startDate)} ~ {formatDate(endDate)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>여행지역</Text>
                <Text style={styles.value}>{displayCountry}</Text>
              </View>
            </View>
            <View style={styles.infoColumn}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>계약자</Text>
                <Text style={styles.value}>{koreanName || "-"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>영문명</Text>
                <Text style={styles.value}>{englishName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>연락처</Text>
                <Text style={styles.value}>{phoneNumber}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>이메일</Text>
                <Text style={styles.value}>{email}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>
            총 보험료 ({currentPlanData.planName})
          </Text>
          <Text style={styles.totalAmount}>
            {formatNumber(currentPlanData.premium || 0)}원
          </Text>
        </View>

        <View>
          <Text style={styles.sectionTitle}>가입자별 보험료</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>구분</Text>
              <Text style={styles.tableHeaderCell}>성함</Text>
              <Text style={styles.tableHeaderCellRight}>보험료</Text>
            </View>
            {currentPlanData.insuredPersons.map((person, idx) => (
              <View
                key={idx}
                style={[
                  styles.tableRow,
                  idx % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                ]}
              >
                <Text style={styles.tableCell}>
                  {idx === 0 ? "계약자" : "동반인"}
                </Text>
                <Text style={styles.tableCell}>
                  {idx === 0
                    ? koreanName
                    : companions[idx - 1]?.koreanName || person.cusNm}
                </Text>
                <Text style={styles.tableCellRight}>
                  {formatNumber(person.ppsPrem)}원
                </Text>
              </View>
            ))}
          </View>
        </View>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>

      {currentPlanData.insuredPersons.map((person, personIdx) => (
        <Page key={`coverage-${personIdx}`} size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.coverageTitle}>
              {personIdx === 0
                ? `${koreanName}님`
                : `${companions[personIdx - 1]?.koreanName || person.cusNm}님`}
              의 보장 내용
            </Text>
          </View>

          <View style={styles.coverageTable}>
            <View style={styles.coverageTableHeader}>
              <Text style={styles.coverageHeaderCell}>보장명</Text>
              <Text style={styles.coverageHeaderCellAmount}>보상한도</Text>
            </View>

            {person.opapiGnrCoprCtrQuotCovInfCbcVo.map((coverage, covIdx) => (
              <View
                key={covIdx}
                style={[
                  styles.coverageTableRow,
                  covIdx % 2 === 0
                    ? styles.coverageTableRowEven
                    : styles.coverageTableRowOdd,
                ]}
              >
                <Text style={styles.coverageNameCell}>{coverage.covNm}</Text>
                <Text style={styles.coverageAmountCell}>
                  {formatAmount(coverage.insdAmt)}
                </Text>
              </View>
            ))}
          </View>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
            fixed
          />
        </Page>
      ))}
    </Document>
  );
};

export default InsurancePDFTemplate;
