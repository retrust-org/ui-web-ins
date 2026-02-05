import React, { useState } from "react";
import { useSpring, animated } from "react-spring";
import insuranceInfo from "../../../data/ConfirmNoticedata";
import commonDownArrow from "../../../assets/commonDownArrow.svg";

const ConfirmNotice = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  const textAnimation = useSpring({
    height: isOpen ? "auto" : 0,
    opacity: isOpen ? 1 : 0,
    overflow: "hidden",
    config: { duration: 200 },
  });

  // 환경변수에 따른 준법감시인 문구 설정
  const getComplianceText = () => {
    const appType = process.env.REACT_APP_TYPE;
    
    switch (appType) {
      case 'LONGTERM':
        return '준법감시인 심의필 제2025-광고-599호(2025.03.25~2026.03.24)';
      case 'DOMESTIC':
        return '준법감시인 심의필 제2025-광고-681호(2025.04.03~2026.04.02)';
      default:
        return '준법감시인 심의필 제2025-광고-1162호(2025.06.05~2026.06.04)';
    }
  };

  return (
    <>
      <div className="mt-10">
        <div
          className="flex justify-between w-full items-center p-2 mx-auto border-b cursor-pointer"
          onClick={toggleAccordion}
        >
          <p className="font-bold text-sm">보험 가입 전 유의 사항</p>
          <div
            className={`transition-transform duration-1000 transform ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <img src={commonDownArrow} alt="commonDownArrow" />
          </div>
        </div>
        <animated.div className="w-full mx-auto" style={textAnimation}>
          <ul className="p-2">
            {insuranceInfo.map((infoSection, index) => (
              <li className="flex flex-col" key={index}>
                <span className="text-sm font-bold my-3">
                  {Object.keys(infoSection)[0]}
                </span>
                <div>
                  {Object.values(infoSection)[0].map((item, idx) => (
                    <p className="text-xs font-light mb-1" key={idx}>
                      {item}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </animated.div>
      </div>
      <p className="text-xs font-medium mt-5 pb-20">
        {getComplianceText()}
      </p>
    </>
  );
};

export default ConfirmNotice;