import TableLayout, {
  CategoryCell,
  ContentCell,
  SourceCell,
  SectionTitle,
  SubSectionTitle,
  List,
  ListItem,
  DownloadButton,
  Divider,
  SmallText,
} from "./TableLayout";
import styles from "../../../../css/claim/claimTableLayout.module.css";

const Disease = () => {
  const footerText = [
    "※ 사고내용, 특성, 상품(보장내역)에 따라 추가 심사서류를 요구할 수 있습니다.",
    "※ 진단서, 통원확인서, 처방전, 진료확인서, 소견서, 수술확인서, 진료차트 등에는 진단명이 기재되어 있어야 합니다.",
    "※ 피보험자가 미성년자인 경우에는 위임장 없이 친권자(부모) 계좌로 수령 가능합니다.(단, 사망의 경우 친권자의 위임이 필요합니다.)",
    "※ 보험금 청구에 대한 기타 자세한 문의는 고객콜센터(1566-7711)로 연락 바랍니다.",
  ];

  return (
    <TableLayout footerText={footerText}>
      {/* 공통 */}
      <tr>
        <CategoryCell>공통</CategoryCell>
        <ContentCell>
          <SectionTitle>기본</SectionTitle>
          <List>
            <ListItem>보험금청구서(계좌번호 포함)</ListItem>
            <ListItem>개인(신용)정보처리동의서</ListItem>
            <ListItem>신분증 사본</ListItem>
            <ListItem>
              수익자 통장사본 (자동이체계좌와 동일한 경우 제외)
            </ListItem>
          </List>

          <SmallText>
            ※ 모바일/PC로 청구하시는 경우 보험금 청구서 및
            개인(신용)정보처리동의서는 생략 가능
          </SmallText>
          <SmallText>
            ※ 지문정보가 포함된 주민등록증 뒷면은 수집하지 않습니다.
          </SmallText>

          <DownloadButton
            text="보험금 청구서"
            pdfUrl="/pdf/insurance_claim_form.pdf"
          />
          <DownloadButton
            text="개인(신용)정보처리동의서"
            pdfUrl="/pdf/privacy_consent_form.pdf"
          />

          <Divider />

          <SectionTitle>추가 (필요시)</SectionTitle>
          <List>
            <ListItem>
              가족관계 확인 필요시(배우자, 자녀 등의 보장상품, 수익자가
              미성년자인 경우 등) : 가족관계 확인서류(예:가족관계증명서,
              혼인관계증명서, 기본증명서 등)
            </ListItem>
            <ListItem>
              대리인 청구시(원본) : 위임장, 보험금 청구권자의 인감증명서(또는
              본인서명사실확인서), 보험금 청구권자의 개인(신용)정보처리 동의서
            </ListItem>
          </List>

          <DownloadButton text="위임장" pdfUrl="/pdf/power_of_attorney.pdf" />
        </ContentCell>
        <SourceCell>
          <div className={styles.sourceItems}>
            <p>당사양식</p>
            <p>관공서</p>
            <p>주민센터</p>
            <p>
              주민센터/
              <br />
              관공서
            </p>
          </div>
        </SourceCell>
      </tr>

      {/* 실손 의료비 - 입원 */}
      <tr>
        <CategoryCell rowSpan="2">실손 의료비</CategoryCell>
        <ContentCell>
          <SectionTitle>입원</SectionTitle>
          <List>
            <ListItem>진단서 또는 입퇴원확인서(병명기재)</ListItem>
            <ListItem>진료비 계산 영수증</ListItem>
            <ListItem>진료비세부내역서</ListItem>
          </List>
        </ContentCell>
        <SourceCell>의료기관</SourceCell>
      </tr>

      {/* 실손 의료비 - 통원 */}
      <tr>
        <ContentCell>
          <SectionTitle>통원</SectionTitle>

          <SubSectionTitle>3만원 미만</SubSectionTitle>
          <List>
            <ListItem>진료비 계산 영수증</ListItem>
            <ListItem>진료비세부내역서</ListItem>
          </List>

          <SubSectionTitle>3~10만원</SubSectionTitle>
          <List>
            <ListItem>처방전(질병분류코드포함)</ListItem>
            <ListItem>진료비 계산 영수증</ListItem>
            <ListItem>진료비세부내역서</ListItem>
          </List>

          <SubSectionTitle>10만원 초과</SubSectionTitle>
          <List>
            <ListItem>진단명 및 통원일이 포함된 서류</ListItem>
            <ListItem>진료비 계산 영수증</ListItem>
            <ListItem>진료비세부내역서</ListItem>
          </List>
        </ContentCell>
        <SourceCell>의료기관</SourceCell>
      </tr>

      {/* 입원일당 */}
      <tr>
        <CategoryCell>입원일당</CategoryCell>
        <ContentCell>
          <List>
            <ListItem>입퇴원확인서(진단명 기재)</ListItem>
            <ListItem>진료비세부내역서</ListItem>
          </List>
        </ContentCell>
        <SourceCell>의료기관</SourceCell>
      </tr>

      {/* 진단금 - 첫 번째 행 */}
      <tr>
        <CategoryCell rowSpan="2">진단금</CategoryCell>
        <ContentCell>
          <SectionTitle>기본</SectionTitle>
          <List>
            <ListItem>진단서(한국표준질병사인분류번호 기재)</ListItem>
          </List>

          <SectionTitle>암</SectionTitle>
          <List>
            <ListItem>조직검사결과지(수술시 수술기록지 포함)</ListItem>
          </List>
        </ContentCell>
        <SourceCell>의료기관</SourceCell>
      </tr>

      {/* 진단금 - 두 번째 행 */}
      <tr>
        <ContentCell>
          <SectionTitle>뇌질환</SectionTitle>
          <List>
            <ListItem>CT, MRI 검사 결과지, 영상CD</ListItem>
          </List>

          <SectionTitle>심질환</SectionTitle>
          <List>
            <ListItem>
              관상동맥 조영술, 심전도, 심장효소 혈액검사, 심초음파 등 검사
              결과지
            </ListItem>
          </List>
        </ContentCell>
        <SourceCell>의료기관</SourceCell>
      </tr>

      {/* 수술비 */}
      <tr>
        <CategoryCell>수술비</CategoryCell>
        <ContentCell>
          <List>
            <ListItem>진단명, 수술명, 수술일자가 포함된 서류</ListItem>
            <ListItem>진료비세부내역서</ListItem>
          </List>
        </ContentCell>
        <SourceCell>의료기관</SourceCell>
      </tr>

      {/* 사망 - 기본 */}
      <tr>
        <CategoryCell rowSpan="2">사망</CategoryCell>
        <ContentCell>
          <SectionTitle>기본</SectionTitle>
          <List>
            <ListItem>사망진단서(사체검안서) 원본</ListItem>
            <ListItem>
              또는 사망진단서(사체검안서) 사본 + 기본증명서(사망사실기재)
            </ListItem>
          </List>
        </ContentCell>
        <SourceCell>
          <div className={styles.sourceItems}>
            <p>의료기관</p>
            <p>주민센터</p>
          </div>
        </SourceCell>
      </tr>

      {/* 사망 - 수익자 미지정시 */}
      <tr>
        <ContentCell>
          <SectionTitle>수익자 미지정시</SectionTitle>
          <List>
            <ListItem>상속관계 확인서류(가족관계증명서 등)</ListItem>
            <ListItem>
              법적상속인 다수인 경우: 상속인 각각의 위임장 + 인감증명서 필요
            </ListItem>
          </List>
        </ContentCell>
        <SourceCell>주민센터</SourceCell>
      </tr>

      {/* 후유장해 */}
      <tr>
        <CategoryCell>후유장해</CategoryCell>
        <ContentCell>
          <List>
            <ListItem>후유장해 진단서(일반 진단서로 대체 가능한 경우)</ListItem>
            <ListItem>만성신부전: 혈액투석(최초투석일, 환자상태 기재)</ListItem>
            <ListItem>사지절단(절단 부위 명시): X-RAY 결과지</ListItem>
            <ListItem>인공관절 치환술(치환일자, 부위명시): 수술기록지</ListItem>
            <ListItem>
              비장 신장 안구적출(적출일자, 부위명시): 수술기록지
            </ListItem>
            <ListItem>장기전절제(절제일자,부위명시): 수술기록지</ListItem>
            <ListItem>장애인 등록증</ListItem>
            <ListItem>정밀검사결과지(MRI, CT, X-ray, 근전도 검사등)</ListItem>
          </List>
        </ContentCell>
        <SourceCell>
          <div className={styles.sourceItems}>
            <p>
              종합병원
              <br />
              (대학병원)
            </p>
          </div>
        </SourceCell>
      </tr>
    </TableLayout>
  );
};

export default Disease;
