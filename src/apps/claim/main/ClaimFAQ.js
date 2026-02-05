// ClaimFAQ.jsx
import { useState, useRef } from "react";
import styles from "../../../css/claim/claimFAQ.module.css";
import confirmCheck from "../../../assets/confirmCheck.svg";
import ClaimHeader from "../components/ClaimHeader";

function ClaimFAQ() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [openAnswers, setOpenAnswers] = useState({});
  const answerRefs = useRef({});

  const handleClick = (index) => {
    setActiveIndex(index);
  };

  const toggleAnswer = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenAnswers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const faqData = [
    {
      category: "보험가입",
      questions: [
        {
          q: "해외여행자 보험 가입이 가능할까요?",
          a: "3개월 미만의 해외여행 시 만 0~79세까지 가입가능합니다. 단 15세 미만 미성년자의 경우 사망 담보는 제외됩니다.",
        },
        {
          q: "출국 후 보험은 출국 후에만 가입 가능한가요?",
          a: "네. 출국 후 보험은 국내 최초 인슈어트러스트에서 출시한 보험(비행기 출발 시간 24시간 내) 입니다. 출국 전 가입을 원하시면 홈페이지-해외여행자보험을 통해 가입하시면 됩니다.",
        },
        {
          q: "미성년자도 가입할 수 있나요?",
          a: "만 19세 미만의 미성년자인 경우, 동반 가입자로 가입 가능합니다. 단, 미성년자 단독으로는 비대면으로 가입할 수 없습니다.",
        },
        {
          q: "단체가입을 하고싶은데 견적을 받아볼 수 있나요?",
          a: "홈페이지 부가서비스-단체견적 메뉴에서 양식을 다운 받으신 후 업로드해주시면 견적/가입까지 편리하게 이용하실 수 있습니다.",
        },
        {
          q: "해외체류 중인 상태에서 해외여행자보험 가입이\n가능한가요?",
          a: "네. 해외여행자 보험, 출국 후 보험 모두 가입이 가능합니다.",
        },
      ],
    },
    {
      category: "이용 가이드",
      questions: [
        {
          q: "NFT가 무엇인가요?",
          a: "nft는 보험증서를 고객님의 전자지갑에 보험증서를 발행해주는 것, 기념품과 같이 친구에게 선물할 수 있고, 보험금 청구등의 기능들을 사용할 수 있는 링크를 제공하고 있습니다.",
        },
        {
          q: "본인이 아니여도 보험가입 취소가 가능한가요?",
          a: "본인 직접 처리해주시는 것이 가장 좋으나, 특수한 상황에서는 인슈어트러스트 고객센터로 연락 주시면 취소를 도와드립니다.",
        },
        {
          q: "사고접수 방법",
          a: "홈페이지 자주 찾는 메뉴-보험금 청구 메뉴-본인인증 후 해당 서류를 업로드 해주시면 사고접수 진행이 됩니다.",
        },
        {
          q: "24시간 의료상담서비스가 무엇인가요?",
          a: "현지에서 사고 발생 시 연락을 주시면 우리말을 통해 상담을 지원해드립니다. (단, 의료상담만 가능)",
        },
        {
          q: "가입증명서는 어디에 있나요?",
          a: "가입증명서는 계약조회 버튼을 누른 후 가입증명서 버튼을 누르시면 보실 수 있습니다. 혹은, 가입한 이메일 혹은 SMS문자로 확인해보실 수 있습니다.",
        },
      ],
    },
  ];

  const menuItems = ["보험가입", "이용 가이드", "보험금 청구", "보장관련"];

  return (
    <>
      <ClaimHeader titleText="FAQ" />
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          <div className={styles.FAQfilterBtn}>
            <ul>
              {menuItems.map((item, index) => (
                <li
                  key={index}
                  onClick={() => handleClick(index)}
                  className={activeIndex === index ? styles.active : ""}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.faqList}>
            {faqData.map(
              (category, categoryIndex) =>
                categoryIndex === activeIndex && (
                  <ul key={categoryIndex}>
                    {category.questions.map((item, questionIndex) => (
                      <li key={questionIndex} className={styles.faqItem}>
                        <div
                          className={styles.faqQuestion}
                          onClick={() =>
                            toggleAnswer(categoryIndex, questionIndex)
                          }
                        >
                          <div className={styles.questionContent}>
                            <span className={styles.qMark}>Q.</span>
                            <span className={styles.questionText}>
                              {item.q}
                            </span>
                            <img
                              src={confirmCheck}
                              alt="arrow icon"
                              className={`${styles.arrowIcon} ${
                                openAnswers[`${categoryIndex}-${questionIndex}`]
                                  ? styles.rotate
                                  : ""
                              }`}
                            />
                          </div>
                        </div>
                        <div
                          className={`${styles.faqAnswer} ${
                            openAnswers[`${categoryIndex}-${questionIndex}`]
                              ? styles.show
                              : ""
                          }`}
                          style={{
                            height: openAnswers[
                              `${categoryIndex}-${questionIndex}`
                            ]
                              ? answerRefs.current[
                                  `${categoryIndex}-${questionIndex}`
                                ]?.scrollHeight + "px"
                              : "0",
                          }}
                          ref={(el) =>
                            (answerRefs.current[
                              `${categoryIndex}-${questionIndex}`
                            ] = el)
                          }
                        >
                          <div className={styles.answerContent}>{item.a}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ClaimFAQ;
