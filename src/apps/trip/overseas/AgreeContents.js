import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import agreeContentsItem from "../../../data/agreeContentsItem";
import Button from "../../../components/buttons/Button"

function AgreeContents() {
  const { agreement } = useParams();
  const navigate = useNavigate();

  // 선택된 약관 항목의 제목, 부제목, 설명, 내용을 가져오는 함수
  const getAgreementItem = (agreement) => {
    return agreeContentsItem.find((item) => item.title === agreement);
  };

  const agreementItem = getAgreementItem(agreement);

  if (!agreementItem) {
    return null;
  }

  const goBack = () => {
    navigate(-1); // 이전 페이지로 이동
  };

  return (
    <div className="w-full">
      <div className="container mx-auto py-4 px-4">
        {/* 제목 출력 */}
        <h2 className="text-[16px] font-bold mb-4">{agreementItem.title}</h2>

        {/* 내용 출력 */}
        <div className="mb-6">
          {agreementItem.contents.map((content, index) => (
            <p key={index} className="text-[12px] mb-2">
              {content}
            </p>
          ))}
        </div>

        {/* 섹션 출력 */}
        {agreementItem.sections.map((section, index) => (
          <div key={index} className="mb-6">
            <h3 className="text-sm font-semibold mb-2">{section.subtitle}</h3>
            <div className="space-y-2">
              {/* 섹션 설명 출력 */}
              {section.description.map((item, idx) => (
                <p key={idx} className="text-[12px]">
                  {item}
                </p>
              ))}
              {/* sub_description 출력 */}
              {section.sub_descrition && (
                <div className="ml-0 space-y-1">
                  {section.sub_descrition.map((subItem, subIdx) => (
                    <p key={subIdx} className="text-[12px]">
                      {subItem}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <Button onClick={goBack}>뒤로 가기</Button>
    </div>
  );
}

export default AgreeContents;
