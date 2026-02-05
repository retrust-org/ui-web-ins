import BaseModalBottom from "../../../components/layout/BaseModalBottom";
import styles from "../../../css/disasterSafeguard/workPlaceMenuList.module.css";
import cancel from "../../../assets/commonX.svg";

function WorkPlaceMenuList({ businessType, onSelect, onClose }) {
  // 소상인 메뉴 아이템 배열
  const smallBusinessItems = [
    "도매 및 소매업",
    "숙박 및 음식점업",
    "정보통신업",
    "금융 및 보험업",
    "부동산업",
    "전문, 과학 및 기술 서비스업",
    "사업시설 관리, 사업 지원 및 임대 서비스업",
    "교육 서비스업",
    "보건업 및 사회복지 서비스업",
    "예술, 스포츠 및 여가관련 서비스업",
    "협회 및 단체, 수리 및 기타 개인 서비스업",
  ];

  // 소공인 메뉴 아이템 배열
  const smallManufacturerItems = [
    "식료품 제조업",
    "음료 제조업",
    "담배 제조업",
    "섬유제품 제조업(의복 제조업 제외)",
    "의복, 의복 액세사리 및 모피제품 제조업",
    "가죽, 가방 및 신발 제조업",
    "목재 및 나무제품 제조업(가구 제조업은 제외)",
    "펄프, 종이 및 종이제품 제조업",
    "인쇄 및 기록맥체 복제업",
    "코크스, 연탄 및 석유정제품 제조업",
    "화학물질 및 화학제품 제조업(의약품 제조업 제외)",
    "의료용 물질 및 의약품 제조업",
    "고무제품 및 플라스틱제품 제조업",
    "비금속 광물제품 제조업",
    "1차 금속 제조업",
    "금속 가공제품 제조업(기계 및 가구제조업 제외)",
    "전자부품, 컴퓨터, 영상, 음향 및 통신장비 제조업",
    "의료, 정밀 광학기기 및 시계 제조업",
    "전기장비 제조업",
    "그 밖의 제품 제조업",
    "산업용 기계 및 장비수리업",
  ];

  // 비즈니스 타입에 따라 표시할 아이템 배열 선택
  const displayItems =
    businessType === "소상인" ? smallBusinessItems : smallManufacturerItems;

  // 아이템 선택 핸들러
  const handleItemSelect = (item) => {
    if (onSelect) {
      onSelect(item);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <BaseModalBottom onClose={onClose}>
      {({ closeModal }) => (
        <div className={styles.modalContainer}>
          <div className={styles.cancel} onClick={closeModal}>
            <img src={cancel} alt="닫기버튼" />
          </div>
          <h3>업태종목</h3>
          <div className={styles.menuListContainer}>
            <ul className={styles.menuList}>
              {displayItems.map((item, index) => (
                <li key={index} onClick={() => handleItemSelect(item)}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </BaseModalBottom>
  );
}

export default WorkPlaceMenuList;
