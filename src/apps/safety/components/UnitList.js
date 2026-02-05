import React from "react";
import styles from "../../../css/disasterSafeguard/floorUnitSelect.module.css";
import SearchInputsBox from "../../../components/inputs/SearchInputsBox";
import Loading from "../../../components/loadings/Loading";

const UnitList = ({
  unitSearchText,
  handleUnitSearch,
  filteredUnits,
  selectedUnits,
  onUnitSelect,
  onBack,
  onAddMoreFloors, // 새 기능을 위한 prop
  loading,
  selectedFloorUnits,
  isSingleFloorMode = false, // 단층 모드 여부
  currentFloor = null, // 현재 선택 중인 층 정보
  currentDong = null, // 현재 선택 중인 동 정보
}) => {
  return (
    <section className={styles.floor}>
      <h2>호수를 선택해주세요</h2>
      <SearchInputsBox
        placeholder="호수를 검색할 수 있어요"
        value={unitSearchText}
        onChange={handleUnitSearch}
      />

      {/* 선택된 층-호수 표시 - 각 호실을 층 정보와 함께 개별 표시 */}
      {selectedFloorUnits && selectedFloorUnits.length > 0 && (
        <div className={styles.selectedUnitsInfo}>
          {selectedFloorUnits.map((item, index) => {
            const floorText =
              item.floor.flrGbCdNm === "지하"
                ? `지하 ${item.floor.flrNo}층`
                : `${item.floor.flrNo}층`;
            const dongText = item.dong ? `${item.dong}-` : "";

            // 각 호실을 개별적으로 표시
            return item.units.map((unit, unitIndex) => (
              <div key={`${index}-${unitIndex}`} className={styles.selectedUnitItem}>
                {floorText} {dongText}{unit.hoNm}
              </div>
            ));
          })}
        </div>
      )}

      {loading && <Loading />}

      {/* 층별로 그룹화하여 호수 표시 */}
      {filteredUnits && filteredUnits.length > 0 ? (
        (() => {
          // 층별로 그룹화
          const groupedByFloor = filteredUnits.reduce((acc, unit) => {
            const floorKey = `${unit.flrGbCdNm}_${unit.flrNo}`;
            if (!acc[floorKey]) {
              acc[floorKey] = {
                flrNo: unit.flrNo,
                flrGbCdNm: unit.flrGbCdNm,
                units: []
              };
            }
            acc[floorKey].units.push(unit);
            return acc;
          }, {});

          // 층 정렬 (지하 → 지상 순, 층수 오름차순)
          const sortedFloors = Object.values(groupedByFloor).sort((a, b) => {
            // 지하(10) < 지상(20) 순서
            if (a.flrGbCdNm !== b.flrGbCdNm) {
              return a.flrGbCdNm === "지하" ? -1 : 1;
            }
            // 같은 구분이면 층수 오름차순
            return a.flrNo - b.flrNo;
          });

          // 층이 1개인 경우 층 라벨과 구분선 숨김
          const isSingleFloor = sortedFloors.length === 1;

          return sortedFloors.map((floorGroup, floorIndex) => {
            const floorLabel = floorGroup.flrGbCdNm === "지하"
              ? `지하 ${floorGroup.flrNo}층`
              : `${floorGroup.flrNo}층`;

            return (
              <div key={`floor-${floorIndex}`} className={isSingleFloor ? "" : styles.floorSection}>
                {!isSingleFloor && <h3 className={styles.floorLabel}>{floorLabel}</h3>}
                {/* 단일층 모드(주택풍수해)에서는 세로 리스트, 다중층(소상공인)에서는 그리드 */}
                {isSingleFloorMode ? (
                  <div className={styles.floorList}>
                    <ul>
                      {floorGroup.units.map((unit, index) => {
                        const isSelected = selectedUnits.some(
                          (u) => u.hoNm === unit.hoNm && u.dongNm === unit.dongNm && u.flrNo === unit.flrNo
                        );

                        return (
                          <li
                            key={`${unit.dongNm || ""}-${unit.hoNm}-${index}`}
                            className={isSelected ? styles.active : ""}
                            onClick={() => onUnitSelect(unit)}
                          >
                            {unit.hoNm}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <div className={styles.unitGrid}>
                    {floorGroup.units.map((unit, index) => {
                      const isSelected = selectedUnits.some(
                        (u) => u.hoNm === unit.hoNm && u.dongNm === unit.dongNm && u.flrNo === unit.flrNo
                      );

                      return (
                        <div
                          key={`${unit.dongNm || ""}-${unit.hoNm}-${index}`}
                          className={`${styles.unitItem} ${
                            isSelected ? styles.active : ""
                          }`}
                          onClick={() => onUnitSelect(unit)}
                        >
                          {unit.hoNm}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          });
        })()
      ) : (
        <div className={styles.noData}>데이터가 없습니다</div>
      )}
    </section>
  );
};

export default UnitList;
