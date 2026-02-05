import React from "react";
import styles from "../../../css/disasterSafeguard/floorUnitSelect.module.css";
import SearchInputsBox from "../../../components/inputs/SearchInputsBox";
import Loading from "../../../components/loadings/Loading";

const FloorList = ({
  floorSearchText,
  handleFloorSearch,
  filteredFloors,
  selectedFloor,
  selectedFloors, // 여러층 모드용
  onFloorSelect,
  loading,
  selectedFloorUnits,
  removeFloorUnit,
  isSingleFloorMode, // 단층/여러층 모드 구분
}) => {
  // 지하층, 지상층, 옥탑층 분리
  const undergroundFloors = filteredFloors
    ? filteredFloors.filter((floor) => floor.flrGbCdNm === "지하")
    : [];

  const abovegroundFloors = filteredFloors
    ? filteredFloors.filter((floor) => floor.flrGbCdNm === "지상")
    : [];

  const rooftopFloors = filteredFloors
    ? filteredFloors.filter((floor) => floor.flrGbCdNm === "옥탑")
    : [];

  return (
    <section className={styles.floor}>
      <h2>층을 선택해주세요</h2>
      <SearchInputsBox
        placeholder="층을 검색할 수 있어요"
        value={floorSearchText}
        onChange={handleFloorSearch}
      />

      {/* 선택된 층-호수 표시 */}
      {selectedFloorUnits && selectedFloorUnits.length > 0 && (
        <div className={styles.selectedUnitsInfo}>
          {selectedFloorUnits.map((item, index) => {
            const floorText =
              item.floor.flrGbCdNm === "지하"
                ? `지하 ${item.floor.flrNo}층`
                : item.floor.flrGbCdNm === "옥탑"
                ? `옥탑 ${item.floor.flrNo}층`
                : `${item.floor.flrNo}층`;
            const dongText = item.dong ? `${item.dong}-` : "";

            // 각 호실을 개별적으로 표시 (1층 B-239호, 1층 B-241호)
            const unitItems = item.units.map((unit, unitIndex) => (
              <span key={`${index}-${unitIndex}`} className={styles.unitItem}>
                {floorText} {dongText}{unit.hoNm}
                {unitIndex < item.units.length - 1 ? ", " : ""}
              </span>
            ));

            return (
              <div key={index} className={styles.selectedFloorUnitItem}>
                <span className={styles.floorUnitText}>
                  {unitItems}
                </span>
                <button
                  className={styles.removeButton}
                  onClick={() => removeFloorUnit(item.floor, item.dong)}
                >
                  X
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.floorList}>
        {loading && <Loading />}

        {/* 지하층 목록 */}
        {undergroundFloors.length > 0 && (
          <>
            <ul className={styles.undergroundList}>
              {undergroundFloors.map((floor, index) => {
                // 단층 모드: selectedFloor 사용
                // 여러층 모드: selectedFloors 배열 사용
                const isCurrentlySelected = isSingleFloorMode
                  ? selectedFloor && selectedFloor.flrNo === floor.flrNo && selectedFloor.flrGbCdNm === "지하"
                  : selectedFloors?.some(f => f.flrNo === floor.flrNo && f.flrGbCdNm === "지하");

                // 이미 저장된 층인지 확인
                const isAlreadySelected = selectedFloorUnits?.some(item =>
                  item.floor.flrNo === floor.flrNo &&
                  item.floor.flrGbCdNm === "지하"
                );

                return (
                  <li
                    key={`under-${index}`}
                    className={
                      isCurrentlySelected || isAlreadySelected
                        ? styles.active
                        : ""
                    }
                    onClick={() => onFloorSelect(floor)}
                  >
                    {`지하 ${floor.flrNo}층`}
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {/* 지상층 목록 */}
        {abovegroundFloors.length > 0 && (
          <>
            <ul className={styles.abovegroundList}>
              {abovegroundFloors.map((floor, index) => {
                // 단층 모드: selectedFloor 사용
                // 여러층 모드: selectedFloors 배열 사용
                const isCurrentlySelected = isSingleFloorMode
                  ? selectedFloor && selectedFloor.flrNo === floor.flrNo && selectedFloor.flrGbCdNm === "지상"
                  : selectedFloors?.some(f => f.flrNo === floor.flrNo && f.flrGbCdNm === "지상");

                // 이미 저장된 층인지 확인
                const isAlreadySelected = selectedFloorUnits?.some(item =>
                  item.floor.flrNo === floor.flrNo &&
                  item.floor.flrGbCdNm === "지상"
                );

                return (
                  <li
                    key={`above-${index}`}
                    className={
                      isCurrentlySelected || isAlreadySelected
                        ? styles.active
                        : ""
                    }
                    onClick={() => onFloorSelect(floor)}
                  >
                    {`${floor.flrNo}층`}
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {/* 옥탑층 목록 */}
        {rooftopFloors.length > 0 && (
          <>
            <ul className={styles.rooftopList}>
              {rooftopFloors.map((floor, index) => {
                // 단층 모드: selectedFloor 사용
                // 여러층 모드: selectedFloors 배열 사용
                const isCurrentlySelected = isSingleFloorMode
                  ? selectedFloor && selectedFloor.flrNo === floor.flrNo && selectedFloor.flrGbCdNm === "옥탑"
                  : selectedFloors?.some(f => f.flrNo === floor.flrNo && f.flrGbCdNm === "옥탑");

                // 이미 저장된 층인지 확인
                const isAlreadySelected = selectedFloorUnits?.some(item =>
                  item.floor.flrNo === floor.flrNo &&
                  item.floor.flrGbCdNm === "옥탑"
                );

                return (
                  <li
                    key={`rooftop-${index}`}
                    className={
                      isCurrentlySelected || isAlreadySelected
                        ? styles.active
                        : ""
                    }
                    onClick={() => onFloorSelect(floor)}
                  >
                    {`옥탑 ${floor.flrNo}층`}
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {(!filteredFloors || filteredFloors.length === 0) && (
          <p>데이터가 없습니다</p>
        )}
      </div>
    </section>
  );
};

export default FloorList;
