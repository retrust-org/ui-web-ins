import React from "react";
import styles from "../../../css/disasterSafeguard/floorUnitSelect.module.css";
import SearchInputsBox from "../../../components/inputs/SearchInputsBox";
import Loading from "../../../components/loadings/Loading";

const DongList = ({
  dongSearchText,
  handleDongSearch,
  filteredDongs,
  selectedDong,
  onDongSelect,
  onBack,
  loading,
}) => {
  return (
    <section className={styles.floor}>
      <h2>동을 선택해주세요</h2>
      <SearchInputsBox
        placeholder="동을 검색할 수 있어요"
        value={dongSearchText}
        onChange={handleDongSearch}
      />
      <div className={styles.floorList}>
        {loading && <Loading />}
        <ul>
          {filteredDongs && filteredDongs.length > 0 ? (
            filteredDongs.map((dong, index) => (
              <li
                key={index}
                className={selectedDong === dong ? styles.active : ""}
                onClick={() => onDongSelect(dong)}
              >
                {dong}
              </li>
            ))
          ) : (
            <li>데이터가 없습니다</li>
          )}
        </ul>
      </div>
      <button className={styles.backButton} onClick={onBack}>
        층 선택으로 돌아가기
      </button>
    </section>
  );
};

export default DongList;
