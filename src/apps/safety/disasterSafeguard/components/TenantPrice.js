/* 보장금액선택 - 임차인 */
import RangeInput from "../../../../components/inputs/RangeInput";
import styles from "../../../../css/disasterSafeguard/selectedPrice.module.css";

function TenantPrice({ activeFilter }) {
  return (
    <>
      <div className={styles.priceContainer}>
        <div className={styles.priceSection}>
          <div className={styles.selectedInputContents}>
            <div className={styles.rangeInputWrap}>
              <p>건물</p>
              <RangeInput activeFilter={activeFilter} maxValue={5000} />
              <ul>
                <li>0만원</li>
                <li>최대5천만원</li>
              </ul>
            </div>
            <div className={styles.rangeInputWrap}>
              <p>시설 및 집기 비품</p>
              <RangeInput activeFilter={activeFilter} maxValue={5000} />
              <ul>
                <li>0만원</li>
                <li>최대5천만원</li>
              </ul>
            </div>
            <div className={styles.rangeInputWrap}>
              <p>재고자산</p>
              <RangeInput activeFilter={activeFilter} maxValue={5000} />
              <ul>
                <li>0만원</li>
                <li>최대5천만원</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TenantPrice;
