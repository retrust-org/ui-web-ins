/* 소유자/임차인 - 본인금액선택*/

import RangeInput from "../../../../components/inputs/RangeInput";
import styles from "../../../../css/disasterSafeguard/selectedPrice.module.css";
import { useDisasterInsurance } from "../../../../context/DisasterInsuranceContext";

function LandlordPrice({ activeFilter, owsDivCon, tngDivCd, onUpdateCoverageAmounts }) {
  // Context에서 현재 가입금액 가져오기
  const { coverageAmounts } = useDisasterInsurance();

  // 소유자/임차인 구분 (owsDivCon: "소유자"/"임차인"/"임차자")
  const isOwner = owsDivCon === "소유자";

  // 소상인/소공인 구분 (tngDivCd: "20"=소상인, "40"=소공인)
  const isMerchant = tngDivCd === "20";

  const handleBuildingAmountChange = (value) => {
    onUpdateCoverageAmounts({ bldgSbcAmt: value }, false); // 자동 변경
  };

  const handleFacilityAmountChange = (value) => {
    onUpdateCoverageAmounts({ fclSbcAmt: value }, false); // 자동 변경
  };

  const handleInventoryAmountChange = (value) => {
    onUpdateCoverageAmounts({ invnAsetSbcAmt: value }, false); // 자동 변경
  };

  const handleMachineryAmountChange = (value) => {
    onUpdateCoverageAmounts({ instlMachSbcAmt: value }, false); // 자동 변경
  };

  const handleBuildingManualChange = (value) => {
    onUpdateCoverageAmounts({ bldgSbcAmt: value }, true); // 수동 변경
  };

  const handleFacilityManualChange = (value) => {
    onUpdateCoverageAmounts({ fclSbcAmt: value }, true); // 수동 변경
  };

  const handleInventoryManualChange = (value) => {
    onUpdateCoverageAmounts({ invnAsetSbcAmt: value }, true); // 수동 변경
  };

  const handleMachineryManualChange = (value) => {
    onUpdateCoverageAmounts({ instlMachSbcAmt: value }, true); // 수동 변경
  };

  return (
    <>
      <div className={styles.priceContainer}>
        <div className={styles.priceSection}>
          <div className={styles.selectedInputContents}>
            {/* 건물가입금액 - 소유자만 표시 (5천만원 이하, 임차인 불가) */}
            {isOwner && (
              <div className={styles.rangeInputWrap}>
                <p>건물가입금액</p>
                <RangeInput
                  activeFilter={activeFilter}
                  maxValue={5000}
                  value={coverageAmounts.bldgSbcAmt}
                  onChange={handleBuildingAmountChange}
                  onManualChange={handleBuildingManualChange}
                />
                <ul>
                  <li>500만원</li>
                  <li>최대5천만원</li>
                </ul>
              </div>
            )}

            {/* 시설가입금액 (5천만원 이하, 집기비품 포함) */}
            <div className={styles.rangeInputWrap}>
              <p>시설가입금액</p>
              <RangeInput
                activeFilter={activeFilter}
                maxValue={5000}
                value={coverageAmounts.fclSbcAmt}
                onChange={handleFacilityAmountChange}
                onManualChange={handleFacilityManualChange}
              />
              <ul>
                <li>500만원</li>
                <li>최대5천만원</li>
              </ul>
            </div>

            {/* 재고자산가입금액 (5천만원 이하) */}
            <div className={styles.rangeInputWrap}>
              <p>재고자산가입금액</p>
              <RangeInput
                activeFilter={activeFilter}
                maxValue={5000}
                value={coverageAmounts.invnAsetSbcAmt}
                onChange={handleInventoryAmountChange}
                onManualChange={handleInventoryManualChange}
              />
              <ul>
                <li>500만원</li>
                <li>최대5천만원</li>
              </ul>
            </div>

            {/* 설치기계가입금액 (5천만원 이하) - 소공인만 표시 (소상인 불가) */}
            {!isMerchant && (
              <div className={styles.rangeInputWrap}>
                <p>설치기계가입금액</p>
                <RangeInput
                  activeFilter={activeFilter}
                  maxValue={5000}
                  value={coverageAmounts.instlMachSbcAmt}
                  onChange={handleMachineryAmountChange}
                  onManualChange={handleMachineryManualChange}
                />
                <ul>
                  <li>500만원</li>
                  <li>최대5천만원</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default LandlordPrice;
