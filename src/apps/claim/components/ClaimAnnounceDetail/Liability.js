import TableLayout, {
  CategoryCell,
  ContentCell,
  SourceCell,
  List,
  ListItem,
  DownloadButton,
} from "./TableLayout";
import styles from "../../../../css/claim/claimTableLayout.module.css";

const Liability = () => {
  const footerText = [
    "※ 동 안내장은 일반적인 보험금 청구 시 필요한 서류를 기재한 것으로 제출서류의 대체 또는 추가서류를 요청할수 있습니다.",
    "※ 보험금 청구에 대한 더 자세한 내용은 당사 홈페이지(www.meritzfire.com)를 통해 확인하실 수 있으며, 기타 자세한 문의는 콜센터(1566-7711)로 문의하시기 바랍니다.",
    "※ 사고내용, 특성, 상품(보장내역)에 따라 추가 심사서류가 필요할 수 있습니다.",
  ];

  return (
    <TableLayout footerText={footerText}>
      {/* 배상책임 - 공통서류 */}
      <tr>
        <CategoryCell>
          배상책임
          <br /> (공통서류)
        </CategoryCell>
        <ContentCell>
          <List>
            <ListItem>보험금청구서(계좌번호 포함)</ListItem>
            <ListItem>사고경위서</ListItem>
            <ListItem>
              개인(신용)정보처리동의서(주민등록등본, 가족관계증명서에 기재 된
              모든 당사자의 동의서)
            </ListItem>
            <ListItem>견적서, 기타 손해액 입증자료(필요시)</ListItem>
            <ListItem>피보험자의 주민등록등본, 가족관계증명서</ListItem>
          </List>

          <DownloadButton
            text="보험금 청구서"
            pdfUrl="/pdf/insurance_claim_form.pdf"
          />
          <DownloadButton
            text="사고경위서"
            pdfUrl="/pdf/accident_report_form.pdf"
          />
          <DownloadButton
            text="개인(신용)정보처리동의서"
            pdfUrl="/pdf/privacy_consent_form.pdf"
          />
        </ContentCell>
        <SourceCell>
          <div className={styles.sourceItems}>
            <p>당사양식</p>
            <p>관공서</p>
          </div>
        </SourceCell>
      </tr>

      {/* 배상책임 - 대인 */}
      <tr>
        <CategoryCell>
          배상책임
          <br /> (대인)
        </CategoryCell>
        <ContentCell>
          <List>
            <ListItem>진단서 (병명기재, 입(통)원 기간 명시)</ListItem>
            <ListItem>치료비명세서 및 치료비영수증</ListItem>
            <ListItem>입퇴원확인서(입원시)</ListItem>
            <ListItem>기타 손해액 입증자료(대인)</ListItem>
          </List>
        </ContentCell>
        <SourceCell>해당의료기관</SourceCell>
      </tr>

      {/* 배상책임 - 대물 */}
      <tr>
        <CategoryCell>
          배상책임 <br />
          (대물)
        </CategoryCell>
        <ContentCell>
          <List>
            <ListItem>견적서, 기타 손해액 입증자료(대물)</ListItem>
          </List>
        </ContentCell>
        <SourceCell></SourceCell>
      </tr>

      {/* 배상책임 - 소송시 */}
      <tr>
        <CategoryCell>
          배상책임 <br />
          (소송시)
        </CategoryCell>
        <ContentCell>
          <List>
            <ListItem>소송서류 일체(소장, 갑호증등)</ListItem>
          </List>
        </ContentCell>
        <SourceCell></SourceCell>
      </tr>
    </TableLayout>
  );
};

export default Liability;
