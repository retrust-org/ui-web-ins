import React, { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import CustomInput from "../../../components/inputs/CustomInput";
import InsertDate from "../overseas/InsertDate";
import DomesticInsertDate from "../domestic/insert/InsertDate";
import { setSelectedCountryData } from "../../../redux/store";
import CityInfoData from "../../../data/CityinfoData.json";
import SuccessModal from "../../../components/modals/SuccessModal";
import ErrorModal from "../../../components/modals/ErrorModal";
import Loading from "../../../components/loadings/Loading";
import styles from "../../../css/common/calcExcel.module.css";
import downloadIcon from "../../../assets/downloadIcon.svg";
import uploadIcon from "../../../assets/uploadIcon.svg";
import {
  parseUserData,
  validateUserData,
  createIndemnityData,
  createInsuranceData,
} from "../../../utils/excelUtils";

function CalcExcel({
  faRetrustData,
  onDataChange,
  selectedCountry,
  setSelectedCountry,
  shouldReset,
}) {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const appType = process.env.REACT_APP_TYPE || "";

  useEffect(() => {
    if (shouldReset) {
      setUploadedFileName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (onDataChange) {
        onDataChange(null);
      }
    }
  }, [shouldReset, onDataChange]);

  useEffect(() => {
    try {
      const storedUserData = sessionStorage.getItem("calcExcel_userData");
      const storedFileName = sessionStorage.getItem("calcExcel_fileName");

      if (storedUserData && onDataChange) {
        const parsedData = JSON.parse(storedUserData);
        onDataChange(parsedData);
      }

      if (storedFileName) {
        setUploadedFileName(storedFileName);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  const findCountryData = (countryInput) => {
    if (!countryInput || !countryInput.trim()) return null;

    const cleanInput = countryInput.replace(/[\r\n]/g, "").trim();

    let countryInfo = CityInfoData.find(
      (item) => item.korNatlNm && item.korNatlNm.trim() === cleanInput
    );

    if (countryInfo) {
      return {
        cityNatlCd: countryInfo.cityNatlCd,
        korNatlNm: countryInfo.korNatlNm,
        korCityNm: countryInfo.korCityNm,
      };
    }

    const cityMatch = CityInfoData.find(
      (item) =>
        item.korCityNm &&
        (item.korCityNm.trim() === cleanInput ||
          item.korCityNm.includes(cleanInput))
    );

    if (cityMatch) {
      return {
        cityNatlCd: cityMatch.cityNatlCd,
        korNatlNm: cityMatch.korNatlNm,
        korCityNm: cityMatch.korCityNm,
      };
    }

    countryInfo = CityInfoData.find(
      (item) =>
        item.korNatlNm &&
        (item.korNatlNm.includes(cleanInput) ||
          cleanInput.includes(item.korNatlNm))
    );

    if (countryInfo) {
      return {
        cityNatlCd: countryInfo.cityNatlCd,
        korNatlNm: countryInfo.korNatlNm,
        korCityNm: cityMatch?.korCityNm,
      };
    }

    return null;
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dropZoneRef.current?.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const fileName = file.name.toLowerCase();

      if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
        setModalMessage("엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.");
        setShowErrorModal(true);
        return;
      }

      processFile(file);
    }
  };

  const renderCalendar = () => {
    switch (appType) {
      case "OVERSEAS":
        return <InsertDate faRetrustData={faRetrustData} />;
      case "DOMESTIC":
        return <DomesticInsertDate faRetrustData={faRetrustData} />;
      default:
        return null;
    }
  };

  const renderCountryInput = () => {
    const handleCountryChange = (value) => {
      if (setSelectedCountry) {
        setSelectedCountry(value);
      }

      if (value && value.trim()) {
        const countryData = findCountryData(value);
        if (countryData) {
          dispatch(setSelectedCountryData(countryData));
        }
      } else {
        dispatch(setSelectedCountryData(null));
      }
    };

    if (appType === "DOMESTIC") {
      return (
        <div className={styles.tripContainer}>
          <p className={styles.tripContainerTitle}>여행지</p>
          <CustomInput
            type="text"
            placeholder="한국"
            value="한국"
            onChange={() => { }}
            readOnly={true}
          />
        </div>
      );
    }

    return (
      <div className={styles.tripContainer}>
        <p className={styles.tripContainerTitle}>여행지</p>
        <CustomInput
          type="text"
          placeholder="여행지를 입력해주세요"
          value={selectedCountry || ""}
          onChange={handleCountryChange}
        />
      </div>
    );
  };

  const processFile = async (file) => {
    setIsUploading(true);
    try {
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });

      const XLSX = await import("xlsx");
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      // utils 함수 사용하여 데이터 파싱
      const { contractor, companions } = parseUserData(jsonData, appType);

      // 데이터 유효성 검증
      validateUserData(contractor, companions);

      // 데이터 구조 생성
      const indemnityData = createIndemnityData(contractor, companions);
      const insuranceData = createInsuranceData(contractor, companions);

      setUploadedFileName(file.name);

      const uploadData = {
        contractor,
        companions,
        indemnityData,
        insuranceInfo: insuranceData,
      };

      if (onDataChange) {
        onDataChange(uploadData);
      }

      try {
        sessionStorage.setItem(
          "calcExcel_userData",
          JSON.stringify(uploadData)
        );
        sessionStorage.setItem("calcExcel_fileName", file.name);
      } catch (error) {
        console.warn("세션스토리지 저장 실패:", error);
      }

      setModalMessage(`파일 업로드가 완료되었습니다.`);
      setShowSuccessModal(true);
    } catch (error) {
      setModalMessage(
        error.message || "엑셀 파일 처리 중 오류가 발생했습니다."
      );
      setShowErrorModal(true);
      setUploadedFileName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      setModalMessage("엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.");
      setShowErrorModal(true);
      return;
    }

    await processFile(file);
  };

  const downloadTemplate = async () => {
    try {
      const fileName =
        appType === "DOMESTIC"
          ? "국내단체견적양식.xlsx"
          : "해외단체견적양식.xlsx";

      const response = await fetch(`/${fileName}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });

      if (!response.ok) {
        throw new Error(`파일을 찾을 수 없습니다. (${response.status})`);
      }

      const arrayBuffer = await response.arrayBuffer();

      const blob = new Blob([arrayBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.setAttribute('target', '_blank');

      document.body.appendChild(link);
      link.click();

      // 메모리 정리를 위한 지연
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

    } catch (error) {
      setModalMessage("다운로드 실패: " + error.message);
      setShowErrorModal(true);
    }
  };

  //삭제하기 버튼
  const handleFileRemove = () => {
    setUploadedFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onDataChange) {
      onDataChange(null);
    }

    try {
      sessionStorage.removeItem("calcExcel_userData");
      sessionStorage.removeItem("calcExcel_fileName");
    } catch (error) {
      console.warn("세션스토리지 정리 실패:", error);
    }
  };

  return (
    <div>
      {isUploading && <Loading />}
      {renderCountryInput()}
      <div className={styles.dateContainer}>
        <p className={styles.dateContainerTitle}>여행일정</p>
        {renderCalendar()}
      </div>
      <div className={styles.boundaryLine}>
        <div className={styles.line}></div>
      </div>
      <div className={styles.downloadSection}>
        <div className={styles.btnWrap}>
          <button
            type="button"
            onClick={downloadTemplate}
            className={styles.downloadButton}
          >
            <img src={downloadIcon} alt="downloadIcon" />
            <p>엑셀양식 다운로드</p>
          </button>
        </div>
        <div className={styles.uploadContainer}>
          <input
            type="file"
            ref={fileInputRef}
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
          <div
            ref={dropZoneRef}
            className={`${styles.uploadArea} ${isDragOver ? styles.dragOver : ""
              }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={styles.uploadBtn}
            >
              <p>엑셀 업로드</p>
              <img src={uploadIcon} alt="uploadIcon" />
            </button>
          </div>
          {uploadedFileName && (
            <div className={styles.uploadedFile}>
              <span>📄 {uploadedFileName}</span>
              <button
                type="button"
                onClick={handleFileRemove}
                className={styles.removeBtn}
              >
                파일삭제
              </button>
            </div>
          )}
        </div>
      </div>
      {showSuccessModal && (
        <SuccessModal
          message={modalMessage}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
      {showErrorModal && (
        <ErrorModal
          message={modalMessage}
          onClose={() => setShowErrorModal(false)}
        />
      )}
    </div>
  );
}
export default CalcExcel;
