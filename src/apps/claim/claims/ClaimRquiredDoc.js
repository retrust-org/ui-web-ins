import React from "react";
import commonX from "../../../assets/commonX.svg";
import { useNavigate } from "react-router-dom";

function ClaimRequiredDoc() {
  const navigate = useNavigate();

  const data = [
    {
      category: "기본",
      documents: [
        "보험금청구서 (단사양식)",
        "개인(신청)정보처리동의서",
        "보험증권",
        "여러서류 (본인확인, 입출금확인)",
        "본인수령시 동작성본",
        "보험금 청구서",
        "보험청구서류안내장",
      ],
      issuingAuthority: "당사양식",
    },
    {
      category: "상해 (질병)\n_사망",
      documents: [
        "외국 현지 사망진단서",
        "경찰서 사건사고사실확인원",
        "영사관 사망확인서",
        "사망자의 기본증명서 (발급3개월이내)",
        "(결혼시) 혼인관계증명서(발급3개월이내)",
        "가족관계증명서 (발급3개월이내)",
        "제적등본 (발급3개월이내)",
        "법적상속인들의 위임장 및 인감증명서(발급3개월이내)",
        "사송인의 신분증 + 통장",
      ],
      issuingAuthority: "현지구비",
    },
    {
      category: "상해 (질병)\n_치료비",
      documents: [
        "진단서 또는 소견서 (Medical Record, Initial Note, Doctor’s Note 또는 Office Note 등 진료내용 및 진단 내용을 확인할 수 있는 서류)",
        "진료비 영수증 및 처방부사본",
      ],
      issuingAuthority: "현지구비",
    },
    {
      category: "배상책임\n_대인",
      documents: ["제3자의 진단서 및 치료비 영수증"],
      issuingAuthority: "현지구비",
    },
    {
      category: "배상책임\n_대물",
      documents: ["손해복구서류 및 손상물 수리 견적서"],
      issuingAuthority: "현지구비",
    },
    {
      category: "휴대폰손해\n_파손",
      documents: [
        "휴대폰파손 확인서",
        "파손사진 자료 (전체사진+파손부위사진)",
        "파손된 용품 수리시에는 수리견적서+영수증, 파손된 용품 수리불가시 A/S 수리불가확인서 (해당 제조회사의 A/S센터에서 발급가능)",
      ],
      issuingAuthority: "현지구비",
    },
    {
      category: "휴대폰손해\n_도난",
      documents: [
        "사고증명서 (도난증명서, 현지 경찰서 Police Report 등)",
        "도난품의 과거 구입내역 (구매 날짜 및 가격확인 필요)",
        "도난품 명세 작성 (청구서 or A4용지에 기재)",
      ],
      issuingAuthority: "현지구비",
    },
    {
      category: "특별비용",
      documents: [
        "사고증명서 (사망진단서, 입원확인서 등)",
        "지출된 비용의 명세서 및 영수증",
      ],
      issuingAuthority: "현지구비",
    },
    {
      category: "추가\n(필요시)",
      documents: [
        "가족관계 확인 필요 시(배우자, 자녀 등의 보장상품, 수익자가 미성년자인 경우 등) : 가족관계 확인서류(예: 가족관계증명서, 혼인관계증명서, 기본증명서 등) 관공서",
        "대리인 청구 시(원본) \n: 위임장, 보험금 청구권자의 인감증명서(또는 본인서명사실확인서), 보험금 청구권자의 개인(신용)정보처리 동의서",
      ],
      issuingAuthority: "당사양식/관공서",
    },
  ];

  return (
    <>
      <div className="w-full">
        <div className="flex flex-col px-[20px] gap-[24px]">
          <div className="flex justify-end mt-[20px] cursor-pointer">
            <img src={commonX} alt="x" onClick={() => navigate(-1)} />
          </div>
          <h3 className="font-semibold text-[20px] leading-[24px]">공통</h3>
          <p className="text-[#1B1E28] text-[14px] lg:text-[16px] font-normal leading-[19.6px]">
            해외여행에 대한 공통 필요서류 안내
          </p>
          <div className="w-full">
            <div className="overflow-hidden rounded-[12px] border-[#D6D6D6]">
              <table className="w-full bg-[#F3F4F6] border">
                <thead className="">
                  <tr className="bg-[#E8E9EA]">
                    <th className="py-3 px-3 border-b border-r border-[#D6D6D6] text-xs text-left w-[25%]">
                      보장내역
                    </th>
                    <th className="py-3 px-3 border-b border-r border-[#D6D6D6] text-xs text-left w-[52%]">
                      구비서류
                    </th>
                    <th className="py-3 px-3 border-b border-[#D6D6D6] text-xs text-left">
                      발급처
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index} className="border-b border-[#D6D6D6]">
                      <td className="py-3 px-3 border-r border-[#D6D6D6] text-xs align-top">
                        {item.category.split("\n").map((line, idx) => (
                          <div
                            key={idx}
                            className="text-[#1B1E28] font-medium leading-[16px] mb-[1px]"
                          >
                            {line}
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-3 border-r border-[#D6D6D6] text-xs align-top">
                        <ul className="">
                          {item.documents.map((doc, i) => (
                            <div className="mb-[1px]" key={i}>
                              {index === 0 && (i === 5 || i === 6) ? (
                                <span className="text-left text-[12px] font-normal ml-3">
                                  {doc}
                                </span>
                              ) : (
                                <li className="text-xs flex ">
                                  <span className="mr-1">•</span>
                                  <span className="text-left mb-[4px] text-[12px] font-normal">
                                    {doc}
                                  </span>
                                </li>
                              )}
                            </div>
                          ))}
                        </ul>
                      </td>
                      <td className="py-3 px-3 text-xs align-top border-[#D6D6D6] mb-[1px]">
                        {item.issuingAuthority}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="pb-[20px]">
            <ul className="font-normal text-[12px] ">
              <li className="text-[#66686F] mb-[1px]">
                ※ '선택'으로 표시된 경우, 열거된 서류 중 하나만 제출하면 됩니다.
              </li>
              <li className="text-[#66686F] mb-[1px]">
                ※ 피보험자가 미성년자인 경우에는 위임장 없이 친권자(부모) 계좌로
                수령 가능합니다.(단, 사망의 경우 친권자의 위임이 필요합니다.)
              </li>
              <li className="text-[#66686F] mb-[1px]">
                ※ 동 안내장은 일반적인 보험금 청구 시 필요한 서류를 기재한
                것으로 제출서류의 대체 또는 추가서류를 요청할수 있습니다.
              </li>
              <li className="text-[#66686F] mb-[1px]">
                ※ 보험금 청구에 대한 더 자세한 내용은 당사
                홈페이지(www.meritzfire.com)를 통해 확인하실 수 있으며, 기타
                자세한 문의는 콜센터(1566-7711)로 문의하시기 바랍니다.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default ClaimRequiredDoc;
