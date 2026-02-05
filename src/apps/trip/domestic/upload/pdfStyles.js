import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  // 페이지 기본 스타일
  page: {
    padding: "6mm 8mm",
    fontFamily: "Noto Sans KR",
    backgroundColor: "white",
  },

  // 헤더 섹션
  header: {
    marginBottom: "12mm",
  },

  // 회사 정보 헤더
  companyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "2pt solid #111827",
    paddingBottom: "5mm",
  },

  companyInfo: {
    flex: 1,
  },

  companyName: {
    fontSize: 24,
    fontWeight: 700,
    color: "#111827",
    marginBottom: "3mm",
    fontFamily: "Noto Sans KR",
  },

  companyContact: {
    fontSize: 9,
    color: "#4B5563",
    marginBottom: "1mm",
    fontFamily: "Noto Sans KR",
  },

  documentTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: "#111827",
    textAlign: "center",
    marginTop: "4mm",
    marginBottom: "4mm",
    fontFamily: "Noto Sans KR",
  },

  coverageTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111827",
    paddingBottom: "2mm",
    fontFamily: "Noto Sans KR",
    borderBottom: "2pt solid #111827",
  },
  // 정보 그리드 레이아웃
  infoGrid: {
    flexDirection: "row",
    gap: "12mm",
    border: "1pt solid #E5E7EB",
    padding: "8mm 4mm",
    backgroundColor: "#F9FAFB",
    borderRadius: "2mm",
  },

  infoColumn: {
    flex: 1,
  },

  infoRow: {
    flexDirection: "row",
    marginBottom: "5mm",
    alignItems: "center",
  },

  label: {
    width: "25mm",
    color: "#4B5563",
    fontSize: 12,
    fontWeight: 400,
    fontFamily: "Noto Sans KR",
  },

  value: {
    flex: 1,
    color: "#111827",
    fontSize: 10,
    fontWeight: 400,
    fontFamily: "Noto Sans KR",
  },

  // 총 보험료 섹션
  totalSection: {
    marginTop: "10mm",
    marginBottom: "15mm",
    border: "2pt solid #386937",
    borderRadius: "2mm",
    padding: "8mm",
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: 600,
    color: "#1F2937",
    marginBottom: "5mm",
    fontFamily: "Noto Sans KR",
  },

  totalAmount: {
    fontSize: 24,
    fontWeight: 700,
    color: "#3CB371",
    textAlign: "right",
    fontFamily: "Noto Sans KR",
  },

  // 보험료 섹션

  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#1F2937",
    fontFamily: "Noto Sans KR",
  },

  planCard: {
    flex: 1,
    border: "1pt solid #2563EB",
    borderRadius: "2mm",
  },

  planName: {
    fontSize: 10,
    fontWeight: 600,
    color: "#1F2937",
    marginBottom: "2mm",
    fontFamily: "Noto Sans KR",
  },

  planPrice: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1F2937",
    fontFamily: "Noto Sans KR",
  },

  planUnit: {
    fontSize: 14,
    fontWeight: 400,
    color: "#4B5563",
    marginLeft: "1mm",
    fontFamily: "Noto Sans KR",
  },

  // 기본 테이블 스타일
  table: {
    width: "100%",
    marginTop: "4mm",
    border: "1pt solid #E5E7EB",
    borderRadius: "2mm",
    overflow: "hidden",
  },

  tableHeader: {
    flexDirection: "row",
    padding: "2mm 3mm",
    borderBottom: "1pt solid #E5E7EB",
  },

  tableHeaderCell: {
    flex: 1,
    fontSize: 10,
    fontWeight: 600,
    color: "#374151",
    fontFamily: "Noto Sans KR",
  },

  tableHeaderCellRight: {
    flex: 1,
    fontSize: 10,
    fontWeight: 600,
    color: "#374151",
    textAlign: "right",
    fontFamily: "Noto Sans KR",
  },

  tableRow: {
    flexDirection: "row",
    padding: "3mm 4mm",
    borderBottom: "1pt solid #E5E7EB",
  },

  tableRowEven: {
    backgroundColor: "#F9FAFB",
  },

  tableRowOdd: {
    backgroundColor: "white",
  },

  tableCell: {
    flex: 1,
    fontSize: 10,
    fontWeight: 400,
    fontFamily: "Noto Sans KR",
  },

  tableCellRight: {
    flex: 1,
    fontSize: 10,
    fontWeight: 400,
    textAlign: "right",
    fontFamily: "Noto Sans KR",
  },

  // 보장내역 테이블 스타일
  coverageTable: {
    border: "1pt solid #E5E7EB",
    borderRadius: "2mm",
  },

  coverageTableHeader: {
    flexDirection: "row",
    padding: "2mm 3mm",
    borderBottom: "1pt solid #E5E7EB",
  },

  coverageHeaderCell: {
    width: "65%",
    fontSize: 10,
    fontWeight: 600,
    color: "#374151",
    fontFamily: "Noto Sans KR",
    paddingRight: "2mm",
  },

  coverageHeaderCellAmount: {
    width: "35%",
    fontSize: 10,
    fontWeight: 600,
    color: "#374151",
    textAlign: "right",
    fontFamily: "Noto Sans KR",
  },

  coverageTableRow: {
    flexDirection: "row",
    padding: "2mm 3mm",
    borderBottom: "1pt solid #E5E7EB",
    minHeight: "8mm",
    alignItems: "center",
  },

  coverageTableRowEven: {
    backgroundColor: "#F9FAFB",
  },

  coverageTableRowOdd: {
    backgroundColor: "white",
  },

  coverageNameCell: {
    width: "65%",
    fontSize: 10,
    fontWeight: 400,
    fontFamily: "Noto Sans KR",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    lineHeight: 1.4,
  },

  coverageAmountCell: {
    width: "35%",
    fontSize: 10,
    fontWeight: 400,
    textAlign: "right",
    fontFamily: "Noto Sans KR",
  },

  // 하단 텍스트 스타일
  footnote: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: "5mm",
    lineHeight: 1.4,
    fontWeight: 400,
    fontFamily: "Noto Sans KR",
  },

  pageNumber: {
    position: "absolute",
    fontSize: 10,
    bottom: "15mm",
    paddingTop: "6mm",
    left: 0,
    right: 0,
    textAlign: "center",
    color: "#6B7280",
    fontFamily: "Noto Sans KR",
  },
});
