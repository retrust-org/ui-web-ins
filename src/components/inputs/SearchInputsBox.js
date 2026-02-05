import React from "react";
import styles from "../../css/disasterSafeguard/floorUnitSelect.module.css";
import searchIcon from "../../assets/addressSearch-search.svg";

const SearchInputsBox = ({ placeholder, value, onChange }) => {
  return (
    <div className={styles.searchFloor}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={styles.searchInput}
      />
      <img src={searchIcon} alt="searchIcon" />
    </div>
  );
};

export default SearchInputsBox;
