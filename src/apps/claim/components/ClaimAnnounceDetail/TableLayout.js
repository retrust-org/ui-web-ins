import styles from "../../../../css/claim/claimTableLayout.module.css";
import ClaimHeader from "../../components/ClaimHeader";
import ClaimButton from "../../../../components/buttons/ClaimButton";
import { useNavigate } from "react-router-dom";
import useClaimTableButton from "../../../../hooks/useClaimTableButton";

const TableLayout = ({ children, footerText }) => {
  const navigate = useNavigate();
  const { tableBtnPath, contextBtnName } = useClaimTableButton();

  // 버튼 클릭 핸들러
  const handleButtonClick = () => {
    if (tableBtnPath) {
      navigate(tableBtnPath);
    }
  };

  return (
    <>
      <ClaimHeader titleText="청구안내" />
      <div className={styles.container}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeader}>
              <th
                className={`${styles.tableHeaderCell} ${styles.categoryCell}`}
              >
                보장내역
              </th>
              <th className={`${styles.tableHeaderCell} ${styles.contentCell}`}>
                구비서류
              </th>
              <th className={`${styles.tableHeaderCell} ${styles.sourceCell}`}>
                발급처
              </th>
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>

        {footerText && (
          <div className={styles.footerText}>
            {footerText.map((text, index) => (
              <p key={index} className={styles.footerParagraph}>
                {text}
              </p>
            ))}
          </div>
        )}
        <div className={styles.fixedButton}>
          <ClaimButton
            buttonText={contextBtnName || "다음으로"}
            onClick={handleButtonClick}
          />
        </div>
      </div>
    </>
  );
};

// DownloadButton 컴포넌트 수정
export const DownloadButton = ({ text, pdfUrl }) => {
  const handleDownload = () => {
    if (pdfUrl) {
      // 파일 이름 한글로 설정
      const koreanFileNames = {
        "/pdf/insurance_claim_form.pdf": "보험금청구서.pdf",
        "/pdf/privacy_consent_form.pdf": "개인정보처리동의서.pdf",
        "/pdf/power_of_attorney.pdf": "위임장.pdf",
        "/pdf/accident_report_form.pdf": "사고경위서.pdf",
      };

      // URL에서 파일 경로 추출
      const fileName = koreanFileNames[pdfUrl] || pdfUrl.split("/").pop();

      // 파일 다운로드 처리
      fetch(pdfUrl)
        .then((response) => response.blob())
        .then((blob) => {
          // Blob으로 URL 생성
          const url = window.URL.createObjectURL(blob);

          // 가상의 링크 요소 생성
          const link = document.createElement("a");
          link.href = url;
          link.download = fileName;

          // 링크 클릭을 트리거하여 다운로드 시작
          document.body.appendChild(link);
          link.click();

          // 링크 제거
          document.body.removeChild(link);

          // URL 객체 해제
          window.URL.revokeObjectURL(url);
        })
        .catch((error) => {
          console.error("파일 다운로드 중 오류가 발생했습니다:", error);
        });
    }
  };

  return (
    <div
      className={styles.downloadButton}
      onClick={handleDownload}
      style={{ cursor: pdfUrl ? "pointer" : "default" }}
    >
      {text}
      <svg
        className={styles.downloadIcon}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 16L12 8"
          stroke="#333333"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 13L12 16L15 13"
          stroke="#333333"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 16V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V16"
          stroke="#333333"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

// 목록 항목 컴포넌트
export const ListItem = ({ children, bullet = "•" }) => (
  <li className={styles.listItem}>
    <span className={styles.listBullet}>{bullet}</span>
    {children}
  </li>
);

// 목록 컴포넌트
export const List = ({ children }) => (
  <ul className={styles.listContainer}>{children}</ul>
);

// 섹션 제목 컴포넌트
export const SectionTitle = ({ children }) => (
  <div className={styles.sectionTitle}>{children}</div>
);

// 서브 섹션 제목 컴포넌트
export const SubSectionTitle = ({ children }) => (
  <div className={styles.subSectionTitle}>{children}</div>
);

// 구분선 컴포넌트
export const Divider = () => <div className={styles.divider} />;

// 작은 텍스트 컴포넌트
export const SmallText = ({ children }) => (
  <div className={styles.smallText}>{children}</div>
);

// 카테고리 셀 컴포넌트
export const CategoryCell = ({ children, rowSpan }) => (
  <td
    className={`${styles.tableCell} ${styles.categoryBg} ${styles.tableCellAlignTop} ${styles.categoryCell}`}
    rowSpan={rowSpan}
  >
    {children}
  </td>
);

// 내용 셀 컴포넌트
export const ContentCell = ({ children }) => (
  <td
    className={`${styles.tableCell} ${styles.tableCellAlignTop} ${styles.contentCell}`}
  >
    {children}
  </td>
);

// 발급처 셀 컴포넌트
export const SourceCell = ({ children }) => (
  <td
    className={`${styles.tableCell} ${styles.tableCellAlignTop} ${styles.sourceCell} ${styles.textCenter}`}
  >
    {children}
  </td>
);

export default TableLayout;
