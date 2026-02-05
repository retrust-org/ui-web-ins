import React from "react";
import styles from "../../../css/claim/claimStatementGrid.module.css";

function PaymentStatementTable({ data }) {
  // 데이터가 없는 경우 처리
  if (!data || !data.hmpgCladjPayDstmRpdcBasMttBcVo || null) {
    return (
      <div className={styles.containerWrap}>
        <div className={styles.Contents_1nd}>
          <span>데이터가 없습니다.</span>
        </div>
      </div>
    );
  }

  const ArrayData = data.hmpgCladjPayDstmRpdcPayDetlBcVo.map((item) => ({
    rpayDt: item.rpayDt || null,
    dcnSeq: item.dcnSeq || null,
    covNm: item.covNm || null,
    insdAmt: item.insdAmt || null,
    metStDt: item.metStDt || null,
    metDdNum: item.metDdNum || null,
    clmAmt: item.clmAmt || null,
    dcnInsAmt: item.dcnInsAmt || null,
    pocomsTrgYn: item.pocomsTrgYn || null,
    prttPayYn: item.prttPayYn || null,
  }));

  const section4nd = data.cladjPayGuidAddtDdcDetlBcVo.map((item) => ({
    addtAmtSum: item.addtAmtSum || null,
    dcnSeq: item.dcnSeq || null,
    ddcAmtSum: item.ddcAmtSum || null,
    dlyIamt: item.dlyIamt || null,
    incmTax: item.incmTax || null,
    kwCnvsPayInsAmt: item.kwCnvsPayInsAmt || null,
    kwcvRpayInsAmt: item.kwcvRpayInsAmt || null,
    lonAmt: item.lonAmt || null,
    rfdAmt: item.rfdAmt || null,
    rsidTax: item.rsidTax || null,
    unclPrem: item.unclPrem || null,
    unpdPrem: item.unpdPrem || null,
  }));

  // 데이터가 있는 경우, 테이블 구성
  return (
    <div>
      <div className={styles.containerWrap}>
        <div className={styles.Contents_1nd}>
          <span>• 계약 및 사고사항</span>
          <div className={styles.container}>
            {/* 지급일자 */}
            <div className={styles.firstCell}>
              <div className={styles.firstCell_headers}>증권번호</div>
              <div className={styles.cell}>
                {data.hmpgCladjPayDstmRpdcBasMttBcVo[0].polNo || null}
              </div>
            </div>
            <div className={styles.firstCell}>
              <div className={styles.firstCell_headers}>상품명</div>
              <div className={styles.cell}>
                {data.hmpgCladjPayDstmRpdcBasMttBcVo[0].pdNm || null}
              </div>
            </div>
            <div className={styles.firstCell}>
              <div className={styles.firstCell_headers}>계약자</div>
              <div className={styles.cell}>
                {data.hmpgCladjPayDstmRpdcBasMttBcVo[0].polhdNm || null}
              </div>
            </div>
            <div className={styles.firstCell}>
              <div className={styles.firstCell_headers}>피보험자</div>
              <div className={styles.cell}>
                {data.hmpgCladjPayDstmRpdcBasMttBcVo[0].inspeNm || null}
              </div>
            </div>
            <div className={styles.firstCell}>
              <div className={styles.firstCell_headers}>보험기간</div>
              <div className={styles.cell}>
                {`${data.hmpgCladjPayDstmRpdcBasMttBcVo[0].insBgnDtm} ~ ${data.hmpgCladjPayDstmRpdcBasMttBcVo[0].insEdDtm}` ||
                  null}
              </div>
            </div>
            <div className={styles.firstCell}>
              <div className={styles.firstCell_headers}>사고일시</div>
              <div className={styles.cell}>
                {data.hmpgCladjPayDstmRpdcBasMttBcVo[0].acdDtm}
              </div>
            </div>
            <div className={styles.firstCell}>
              <div className={styles.firstCell_headers}>청구유형 /사고원인</div>
              <div className={styles.cell}>
                {`${data.hmpgCladjPayDstmRpdcBasMttBcVo[0].clmTp} / ${data.hmpgCladjPayDstmRpdcBasMttBcVo[0].acdCaus}` ||
                  null}
              </div>
            </div>
            <div className={styles.firstCell}>
              <div className={styles.firstCell_headers}>진단</div>
              <div className={styles.cell}>
                T71/G93.1/J80/I46.0 / 질식/달 리 분류되지 않은 무산소성
                뇌손상/성인호흡곤란증후군/ 인공소생술로 성공한 심장정지
              </div>
            </div>
          </div>
        </div>

        {/* 두번쨰반복문 시작 hmpgCladjPayDstmRpdcPayDetlBcVo의 첫번째 배열 */}

        <div className={styles.Contents_2nd}>
          <span>•지급내역</span>
          <div className={styles.container}>
            <div className={styles.doubleCell}>
              <div className={styles.headers}>지급일자</div>
              <div className={styles.cell}>{ArrayData[0].rpayDt || null}</div>
            </div>
            <div className={styles.doubleCell}>
              <div className={styles.headers}>순번</div>
              <div className={styles.cell}>{ArrayData[0].dcnSeq || null}</div>
            </div>
            <div className={styles.celltitle}>담보명</div>
            <div className={styles.section}>
              <div className={styles.section_header}>
                {ArrayData[0].covNm || null}
              </div>
              <div className={styles.subcell}>가입금액</div>
              <div className={styles.subcell}>
                {ArrayData[0].insdAmt || null}
              </div>
              <div className={styles.subcell}>자기부담금</div>
              <div className={styles.subcell}></div>
              <div className={styles.subcell}>지급사유 발생일</div>
              <div className={styles.subcell}>2023-10-07</div>
              <div className={styles.subcell}>일수</div>
              <div className={styles.subcell}>
                {ArrayData[0].metDdNum || null}
              </div>
              <div className={styles.subcell}>청구금액</div>
              <div className={styles.subcell}>
                {ArrayData[0].clmAmt || null}
              </div>
              <div className={styles.subcell}>지급보험금</div>
              <div className={styles.subcell}>
                {ArrayData[0].dcnInsAmt || null}
              </div>
              <div className={styles.subcell}>비례</div>
              <div className={styles.subcell}>
                {ArrayData[0].pocomsTrgYn || null}
              </div>
              <div className={styles.subcell}>분할</div>
              <div className={styles.subcell}>
                {ArrayData[0].prttPayYn || null}
              </div>
            </div>

            {/* 여기에 두 번째 섹션 추가 */}
            <div className={styles.section}>
              <div
                className={`${styles.section_header} ${styles.section_head}`}
              >
                {ArrayData[1].covNm || null}
              </div>
              <div className={styles.subcell}>가입금액</div>
              <div className={styles.subcell}>
                {ArrayData[1].insdAmt || null}
              </div>
              <div className={styles.subcell}>자기부담금</div>
              <div className={styles.subcell}></div>
              <div className={styles.subcell}>지급사유 발생일</div>
              <div className={styles.subcell}>2023-10-07</div>
              <div className={styles.subcell}>일수</div>
              <div className={styles.subcell}>
                {ArrayData[1].metDdNum || null}
              </div>
              <div className={styles.subcell}>청구금액</div>
              <div className={styles.subcell}>
                {ArrayData[1].clmAmt || null}
              </div>
              <div className={styles.subcell}>지급보험금</div>
              <div className={styles.subcell}>
                {ArrayData[1].dcnInsAmt || null}
              </div>
              <div className={styles.subcell}>비례</div>
              <div className={styles.subcell}>
                {ArrayData[1].pocomsTrgYn || null}
              </div>
              <div className={`${styles.subcell} ${styles.subcell_sub}`}>
                분할
              </div>
              <div className={`${styles.subcell} ${styles.subcell_sub}`}>
                {ArrayData[1].prttPayYn || null}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.Contents_4nd}>
          <span>•가산금액 및 공제금액 세부내역</span>
          {section4nd.map((item, index) => (
            <div className={styles.container} key={index}>
              <div className={styles.girdCell}>
                <div className={styles.gridcellText_Title_4nd}>순번</div>
                <div className={styles.gridcellText_Description_4nd}>
                  {item.dcnSeq}
                </div>
              </div>
              <div className={styles.celltitle}>실지급액</div>
              <div className={styles.girdCell}>
                <div className={styles.gridcellText_Title_4nd}>보험금</div>
                <div className={styles.gridcellText_Description_4nd}>
                  {item.kwCnvsPayInsAmt || null}
                </div>
              </div>
              <div className={styles.girdCell}>
                <div className={styles.gridcellText_Title_4nd}>가산금액</div>
                <div className={styles.gridcellText_Description_4nd}></div>
              </div>
              <div className={styles.girdCell}>
                <div className={styles.gridcellText_Title_4nd}>공제금액</div>
                <div className={styles.gridcellText_Description_4nd}></div>
              </div>
              <div className={styles.girdCell}>
                <div className={styles.gridcell_Title_TotalPrice}>총합계</div>
                <div className={styles.gridcell_Description_TotalPrice}>
                  {item.kwCnvsPayInsAmt || null}
                </div>
              </div>
              <div className={styles.celltitle}>공제금액</div>
              <div className={styles.girdCell}>
                <div className={styles.gridcellText_Title_4nd}>미수보험료</div>
                <div className={styles.gridcellText_Description_4nd}>
                  {item.unclPrem || null}
                </div>
              </div>
              <div className={styles.girdCell}>
                <div className={styles.gridcellText_Title_4nd}>미납보험료</div>
                <div className={styles.gridcellText_Description_4nd}>
                  {item.unpdPrem || null}
                </div>
              </div>
              <div className={styles.girdCell}>
                <div className={styles.gridcellText_Title_4nd}>해약환급금</div>
                <div className={styles.gridcellText_Description_4nd}>0</div>
              </div>
              <div className={styles.girdCell}>
                <div className={styles.gridcellText_Title_4nd}>만기환급금</div>
                <div className={styles.gridcellText_Description_4nd}>0</div>
              </div>
              <div className={styles.girdCell}>
                <div className={styles.gridcellText_Title_4nd}>중도환급금</div>
                <div className={styles.gridcellText_Description_4nd}>
                  {item.rfdAmt || null}
                </div>
              </div>
              <div className={styles.girdCell}>
                <div className={styles.gridcellText_Title_4nd}>
                  보험계약
                  <br /> 대출금액
                </div>
                <div className={styles.gridcellText_Description_4nd}>0</div>
              </div>
              <div className={styles.girdCell}>
                <div className={styles.gridcellText_Title_4nd}>소득세</div>
                <div className={styles.gridcellText_Description_4nd}>
                  {item.incmTax || null}
                </div>
              </div>
              <div className={styles.girdCell}>
                <div className={styles.gridcellText_Title_4nd}>주민세</div>
                <div className={styles.gridcellText_Description_4nd}>
                  {item.rsidTax || null}
                </div>
              </div>
              <div className={styles.girdCell}>
                <div className={styles.gridcellText_Title_4nd}>기타</div>
                <div className={styles.gridcellText_Description_4nd}></div>
              </div>
              <div className={styles.girdCell}>
                <div className={styles.gridcell_Title_TotalPrice}>합계</div>
                <div className={styles.gridcell_Description_TotalPrice}>
                  {item.ddcAmtSum || null}
                </div>
              </div>
              <div className={styles.celltitle}>가산금액</div>
              <div className={styles.girdCell}>
                <div className={styles.gridcellText_Title_4nd}>지연이자</div>
                <div className={styles.gridcellText_Description_4nd}>
                  {item.dlyIamt || null}
                </div>
              </div>
              <div className={styles.girdCell}>
                <div className={styles.gridcellText_Title_4nd}>배당금</div>
                <div className={styles.gridcellText_Description_4nd}></div>
              </div>
              <div className={styles.girdCell}>
                <div className={styles.gridcellText_Title_4nd}>기타</div>
                <div className={styles.gridcellText_Description_4nd}>0</div>
              </div>
              <div className={styles.girdCell}>
                <div className={styles.gridcell_Title_TotalPrice}>합계</div>
                <div className={styles.gridcell_Description_TotalPrice}>
                  {item.addtAmtSum || null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PaymentStatementTable;
