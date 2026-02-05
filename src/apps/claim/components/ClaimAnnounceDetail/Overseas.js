import TableLayout, {
  CategoryCell,
  ContentCell,
  SourceCell,
  SectionTitle,
  List,
  ListItem,
  DownloadButton,
} from "./TableLayout";

const Overseas = () => {
  const footerText = [
    "※ 현지구비 서류는 해외 여행 중 발생한 사고/질병에 대해 현지에서 수령해야 하는 서류입니다.",
    "※ 모든 서류는 원본 제출이 원칙이나, 부득이한 경우 사본 제출 시 추가 확인이 필요할 수 있습니다.",
    "※ 영문이 아닌 해외 서류의 경우 번역본을 함께 제출하셔야 합니다.",
    "※ 보험금 청구에 대한 자세한 문의는 고객센터를 통해 확인하실 수 있습니다.",
  ];

  return (
    <TableLayout footerText={footerText}>
      {/* 공통서류 */}
      <tr>
        <CategoryCell>공통서류</CategoryCell>
        <ContentCell>
          <List>
            <ListItem>보험금청구서(당사양식)</ListItem>
            <ListItem>개인(신용)정보처리동의서</ListItem>
            <ListItem>보험증권</ListItem>
            <ListItem>여권사본 (본인확인, 입출국확인)</ListItem>
            <ListItem>본인수령시 통장사본</ListItem>
          </List>

          <DownloadButton
            text="보험금 청구서"
            pdfUrl="/pdf/insurance_claim_form.pdf"
          />
          <DownloadButton
            text="개인(신용)정보처리동의서"
            pdfUrl="/pdf/privacy_consent_form.pdf"
          />
        </ContentCell>
        <SourceCell>당사양식 본인</SourceCell>
      </tr>

      {/* 상해(질병) 사망 */}
      <tr>
        <CategoryCell>
          상해(질병)
          <br />
          사망
        </CategoryCell>
        <ContentCell>
          <List>
            <ListItem>사망진단서 (또는 사체검안서)</ListItem>
            <ListItem>피보험자의 호적등본</ListItem>
            <ListItem>위임장(필요시)</ListItem>
          </List>

          <DownloadButton text="위임장" pdfUrl="/pdf/power_of_attorney.pdf" />
        </ContentCell>
        <SourceCell>현지구비</SourceCell>
      </tr>

      {/* 치료비 */}
      <tr>
        <CategoryCell>치료비</CategoryCell>
        <ContentCell>
          <List>
            <ListItem>진단서</ListItem>
            <ListItem>진료비 세부내역서 및 영수증</ListItem>
            <ListItem>초진기록지</ListItem>
          </List>
        </ContentCell>
        <SourceCell>현지구비</SourceCell>
      </tr>

      {/* 배상책임 - 대인 */}
      <tr>
        <CategoryCell rowSpan="2">배상책임</CategoryCell>
        <ContentCell>
          <SectionTitle>대인</SectionTitle>
          <List>
            <ListItem>제3자의 진단서 및 치료비 영수증</ListItem>
          </List>
        </ContentCell>
        <SourceCell>현지구비</SourceCell>
      </tr>

      {/* 배상책임 - 대물 */}
      <tr>
        <ContentCell>
          <SectionTitle>대물</SectionTitle>
          <List>
            <ListItem>손해증빙서류 및 손상물 수리 견적서</ListItem>
          </List>
        </ContentCell>
        <SourceCell>현지구비</SourceCell>
      </tr>

      {/* 휴대품 손해 */}
      <tr>
        <CategoryCell>휴대품 손해</CategoryCell>
        <ContentCell>
          <List>
            <ListItem>사고증명서 (도난증명서, 현지경찰확인서 등)</ListItem>
            <ListItem>
              손해명세서 (손상물 수리견적서, 파손된 휴대품의 사진 등)
            </ListItem>
            <ListItem>피해품의 구입가격, 구입처 등이 적힌 서류</ListItem>
          </List>
        </ContentCell>
        <SourceCell>현지구비</SourceCell>
      </tr>

      {/* 특별비용 */}
      <tr>
        <CategoryCell>특별비용</CategoryCell>
        <ContentCell>
          <List>
            <ListItem>사고증명서 (사망진단서, 입원확인서 등)</ListItem>
            <ListItem>지출된 비용의 명세서 및 영수증</ListItem>
          </List>
        </ContentCell>
        <SourceCell>현지구비</SourceCell>
      </tr>
    </TableLayout>
  );
};

export default Overseas;
