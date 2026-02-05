import LeftArrow from "../../../assets/commonLeftArrow.svg";
import styles from "../../../css/claim//claimHeader.module.css";
import { useHomeNavigate } from "../../../hooks/useHomeNavigate";

function ClaimSubHeaders({ titleText }) {
  const { navigateToHome } = useHomeNavigate();

  return (
    <>
      <div className={styles.HeaderWrap}>
        <div className={styles.HeaderContents}>
          <div className={styles.ContentsWrap}>
            <img src={LeftArrow} alt="LeftArrow" onClick={navigateToHome} />
            <p>{titleText}</p>
            <div className="w-[24px]"></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ClaimSubHeaders;