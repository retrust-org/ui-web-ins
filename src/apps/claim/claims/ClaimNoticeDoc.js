import { useNavigate } from "react-router-dom";
import overseasSvg from "../../../assets/overseas.svg";
import disease from "../../../assets/disease.svg";
import liability from "../../../assets/liability.svg";
import wound from "../../../assets/wound.svg";
import styles from "../../../css/claim/claimAnnounce.module.css";

// 카테고리 데이터 객체화
const categories = [
  { id: "disease", title: "질병", icon: disease },
  { id: "wound", title: "상해", icon: wound },
  { id: "liability", title: "배상책임", icon: liability },
  { id: "overseas", title: "해외장기체류", icon: overseasSvg },
];

function ClaimNoticeDoc() {
  const navigate = useNavigate();

  // 카테고리 클릭 핸들러
  const handleCategoryClick = (categoryId) => {
    navigate(`/claimAnnounce/${categoryId}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.gridContents}>
        <div className={styles.gridContentsWrap}>
          <ul>
            {categories.map((category) => (
              <li
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className={styles.categoryItem}>
                  <p>{category.title}</p>
                  <img src={category.icon} alt={`${category.title} 아이콘`} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ClaimNoticeDoc;
