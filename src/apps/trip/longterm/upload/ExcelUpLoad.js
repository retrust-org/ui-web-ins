import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import CityInfoData from "../../../../data/CityinfoData.json";
import styles from "../../../../css/trip/excelUpLoad.module.css";
import {
  selectStartDate,
  selectEndDate,
  setSelectedCountryData,
  setGender,
  setDateOfBirth,
  setCompanions,
  setKoreanName,
  setEnglishName,
  setEmail,
  setPhoneNumber,
  setIsFromCsvUpload,
} from "../../../../redux/store";
import EstimateButton from "./EstimateButton";

function ExcelUpLoad() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploadedData, setUploadedData] = useState(null);
  const [isFileProcessed, setIsFileProcessed] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 한글 이름 유효성 검사
  const validateKoreanName = (name) => {
    const koreanNameRegex = /^[가-힣]{2,3}$/;
    return {
      isValid: koreanNameRegex.test(name),
      message: koreanNameRegex.test(name)
        ? ""
        : "이름은 2-3자의 한글만 입력 가능합니다.",
    };
  };

  // 영문 이름 유효성 검사
  const validateEnglishName = (name) => {
    const englishNameRegex = /^[A-Za-z\s]{2,30}$/;
    return {
      isValid: englishNameRegex.test(name),
      message: englishNameRegex.test(name)
        ? ""
        : "영문 이름은 영어 알파벳만 입력 가능합니다. (2-30자)",
    };
  };

  // 이메일 유효성 검사
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return {
      isValid: emailRegex.test(email),
      message: emailRegex.test(email) ? "" : "올바른 이메일 형식이 아닙니다.",
    };
  };

  // 전화번호 유효성 검사
  const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^01[0|1|6|7|8|9]-\d{3,4}-\d{4}$/;
    return {
      isValid: phoneRegex.test(phoneNumber),
      message: phoneRegex.test(phoneNumber)
        ? ""
        : "올바른 휴대폰 번호 형식이 아닙니다. (예: 01012345678)",
    };
  };

  // 생년월일 유효성 검사
  const validateDateOfBirth = (dob) => {
    const dobRegex = /^\d{8}$/;
    const year = parseInt(dob.substring(0, 4));
    const month = parseInt(dob.substring(4, 6));
    const day = parseInt(dob.substring(6, 8));
    const date = new Date(year, month - 1, day);
    const currentYear = new Date().getFullYear();

    if (!dobRegex.test(dob)) {
      return {
        isValid: false,
        message: "생년월일은 8자리 숫자로 입력해주세요. (예: 19901231)",
      };
    }

    if (year < 1900 || year > currentYear) {
      return {
        isValid: false,
        message: "유효하지 않은 출생연도입니다.",
      };
    }

    if (
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31 ||
      date.getMonth() !== month - 1
    ) {
      return {
        isValid: false,
        message: "유효하지 않은 생년월일입니다.",
      };
    }

    return { isValid: true, message: "" };
  };

  // 성별 유효성 검사
  const validateGender = (gender) => {
    return {
      isValid: ["남", "여"].includes(gender),
      message: ["남", "여"].includes(gender)
        ? ""
        : "성별은 '남' 또는 '여'로만 입력 가능합니다.",
    };
  };

  // 여행 날짜 유효성 검사
  const validateTravelDates = (startDate, endDate) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const start = new Date(
      startDate.slice(0, 4),
      parseInt(startDate.slice(4, 6)) - 1,
      startDate.slice(6, 8)
    );
    const end = new Date(
      endDate.slice(0, 4),
      parseInt(endDate.slice(4, 6)) - 1,
      endDate.slice(6, 8)
    );

    const maxDate = new Date(currentDate);
    maxDate.setDate(currentDate.getDate() + 90);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        isValid: false,
        message: "올바른 날짜 형식이 아닙니다. (YYYYMMDD)",
      };
    }
    if (start < currentDate) {
      return { isValid: false, message: "출발일은 현재 날짜 이후여야 합니다." };
    }
    if (end < start) {
      return { isValid: false, message: "도착일은 출발일 이전일 수 없습니다." };
    }
    if (start > maxDate) {
      return {
        isValid: false,
        message: "출발일은 현재로부터 90일 이내여야 합니다.",
      };
    }

    return { isValid: true, message: "" };
  };

  const convertGender = useCallback((gender) => {
    return gender === "남" ? "1" : "2";
  }, []);

  const formatPhoneNumber = (phoneNumber) => {
    const cleaned = phoneNumber.replace(/[^0-9]/g, "");
    if (cleaned.length !== 11) return cleaned;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  };

  const findCountryInfo = (countryInput) => {
    countryInput = countryInput.replace(/[\r\n]/g, "").trim();

    let countryInfo = CityInfoData.find(
      (item) => item.korNatlNm.trim() === countryInput
    );

    if (countryInfo) {
      return { ...countryInfo, displayName: countryInfo.korNatlNm };
    }

    const cityMatch = CityInfoData.find(
      (item) =>
        item.korCityNm === countryInput ||
        (item.korCityNm && item.korCityNm.includes(countryInput))
    );

    if (cityMatch) {
      return { ...cityMatch, displayName: cityMatch.korNatlNm };
    }

    countryInfo = CityInfoData.find(
      (item) =>
        item.korNatlNm.includes(countryInput) ||
        countryInput.includes(item.korNatlNm)
    );

    return countryInfo
      ? { ...countryInfo, displayName: countryInfo.korNatlNm }
      : null;
  };

  const handleDownloadTemplate = () => {
    const templateContent = [
      "첫 번째 줄에는 반드시 계약자 정보를 입력해주세요.",
      "한번에 하나의 여행 보험 가입이 가능합니다. (여러 국가를 여행할 경우 첫 번째 여행국가를 입력하세요.)",
      "",
      "※ 휴대폰 번호 입력 시 앞에 ' 를 붙여주세요. (예: '01012345678)",
      "※ 생년월일은 YYYYMMDD 형식으로 8자리로 입력해주세요. (예: 19900101)",
      "※ 여행지는 국가명으로 입력해주세요. (예: 베트남)",
      "※ 성별은 '남' 또는 '여'로 입력해주세요.",
      "※ 동반자는 아래쪽 동일하게 작성해주시면 됩니다.",
      "",
      "국가,출발일,도착일,이름(국문),이름(영문),생년월일,성별,이메일,휴대폰 번호",
      "호치민,yyyymmdd,yyyyddmm,홍길동,HONG GIL DONG ,20120305,남,OOO@naver.com,'01012345678",
      "호치민,yyyymmdd,yyyyddmm,동반자,HONG GIL DONG ,20120305,여,OOO@naver.com,'01012345678",
    ].join("\n");

    const BOM = "\uFEFF";
    const csvContent = BOM + templateContent;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "간편견적_양식.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    setMessage("파일 다운로드가 완료되었습니다.");
  };

  const saveToRedux = useCallback(
    (data, countryInfo) => {
      const contractor = data[0];

      dispatch(selectStartDate(contractor.출발일));
      dispatch(selectEndDate(contractor.도착일));
      dispatch(
        setSelectedCountryData({
          cityNatlCd: countryInfo.cityNatlCd,
          korNatlNm: countryInfo.displayName,
        })
      );
      dispatch(setGender(convertGender(contractor.성별)));
      dispatch(setDateOfBirth(contractor.생년월일));
      dispatch(setKoreanName(contractor["이름(국문)"]));
      dispatch(setEnglishName(contractor["이름(영문)"]));
      dispatch(setEmail(contractor["이메일"]));
      dispatch(setPhoneNumber(contractor["휴대폰 번호"]));

      const companionsData = data.slice(1).map((companion) => ({
        gender: convertGender(companion.성별),
        dateOfBirth: companion.생년월일,
        koreanName: companion["이름(국문)"],
        englishName: companion["이름(영문)"],
        email: companion["이메일"],
        phoneNumber: companion["휴대폰 번호"],
      }));

      dispatch(setCompanions(companionsData));
      setIsFileProcessed(true);
    },
    [dispatch, convertGender]
  );

  const handleFileSelect = useCallback(
    (event) => {
      const file = event.target.files[0];
      if (!file) return;

      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        setMessage("CSV 파일만 업로드 가능합니다.");
        event.target.value = "";
        return;
      }

      setSelectedFile(file);
      setMessage("");
      setIsFileProcessed(false);

      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const text = e.target.result.replace(/\r\n|\r|\n/g, "\n");
          const lines = text.split("\n");
          const data = [];

          const headerIdx = lines.findIndex(
            (line) =>
              line.includes("국가") &&
              line.includes("출발일") &&
              line.includes("도착일")
          );

          if (headerIdx === -1) {
            throw new Error("올바른 형식의 CSV 파일이 아닙니다.");
          }

          for (let i = headerIdx + 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.startsWith("※")) continue;

            const values = line.split(",").map((value) => value.trim());
            if (values.length < 9 || !values[0]) continue;

            const rowData = {
              국가: values[0],
              출발일: values[1],
              도착일: values[2],
              "이름(국문)": values[3],
              "이름(영문)": values[4],
              생년월일: values[5],
              성별: values[6],
              이메일: values[7],
              "휴대폰 번호": formatPhoneNumber(
                values[8].replace(/[']/g, "").replace(/[^0-9]/g, "")
              ),
            };

            // 각각의 validation 체크
            const koreanNameValidation = validateKoreanName(
              rowData["이름(국문)"]
            );
            if (!koreanNameValidation.isValid) {
              throw new Error(koreanNameValidation.message);
            }

            const englishNameValidation = validateEnglishName(
              rowData["이름(영문)"]
            );
            if (!englishNameValidation.isValid) {
              throw new Error(englishNameValidation.message);
            }

            const emailValidation = validateEmail(rowData["이메일"]);
            if (!emailValidation.isValid) {
              throw new Error(emailValidation.message);
            }

            const phoneValidation = validatePhoneNumber(rowData["휴대폰 번호"]);
            if (!phoneValidation.isValid) {
              throw new Error(phoneValidation.message);
            }

            const dobValidation = validateDateOfBirth(rowData["생년월일"]);
            if (!dobValidation.isValid) {
              throw new Error(dobValidation.message);
            }

            const genderValidation = validateGender(rowData["성별"]);
            if (!genderValidation.isValid) {
              throw new Error(genderValidation.message);
            }

            data.push(rowData);
          }

          if (data.length === 0) {
            throw new Error("데이터를 찾을 수 없습니다. 파일을 확인해주세요.");
          }

          const contractorData = data[0];

          const dateValidation = validateTravelDates(
            contractorData.출발일,
            contractorData.도착일
          );

          if (!dateValidation.isValid) {
            event.target.value = "";
            setSelectedFile(null);
            throw new Error(dateValidation.message);
          }

          const countryInfo = findCountryInfo(contractorData.국가);
          if (!countryInfo) {
            throw new Error("입력된 국가 정보가 유효하지 않습니다.");
          }

          setUploadedData(data);
          saveToRedux(data, countryInfo);
          dispatch(setIsFromCsvUpload(true));
          setMessage("파일이 성공적으로 업로드되었습니다.");
        } catch (error) {
          console.error("파일 처리 중 오류:", error);
          setMessage(error.message || "파일 처리 중 오류가 발생했습니다.");
          setSelectedFile(null);
          setIsFileProcessed(false);
        }
      };

      reader.onerror = () => {
        setMessage("파일 읽기 중 오류가 발생했습니다.");
        setSelectedFile(null);
        setIsFileProcessed(false);
      };

      reader.readAsText(file, "UTF-8");
    },
    [saveToRedux, dispatch]
  );

  const handleNextPage = useCallback(() => {
    if (!uploadedData) {
      setMessage("먼저 파일을 업로드해주세요.");
      return;
    }
    navigate("/indemnity");
  }, [uploadedData, navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>
          파일을 다운 받으신 후 작성해서 업로드 해주세요.
        </h2>

        <div className={styles.cardContent}>
          <div className={styles.uploadArea}>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className={styles.fileInput}
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <div className={styles.uploadIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              </div>
              <p className={styles.uploadText}>
                CSV 파일을 드래그하거나 클릭하여 업로드하세요
              </p>
              {selectedFile && (
                <p className={styles.fileName}>
                  선택된 파일: {selectedFile.name}
                </p>
              )}
            </label>
          </div>

          <button
            onClick={handleDownloadTemplate}
            className={styles.templateButton}
          >
            <svg
              className={styles.buttonIcon}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            견적 양식 다운로드
          </button>

          {message && (
            <div
              className={
                message.includes("완료") || message.includes("성공")
                  ? styles.successMessage
                  : styles.errorMessage
              }
            >
              {message}
            </div>
          )}

          <button
            onClick={handleNextPage}
            disabled={!uploadedData}
            className={styles.nextButton}
          >
            보험 가입하기
            <svg
              className={styles.buttonIcon}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <EstimateButton
            startDate={uploadedData?.[0]?.출발일 || ""}
            endDate={uploadedData?.[0]?.도착일 || ""}
            selectedCountry={useMemo(() => {
              if (!uploadedData?.[0]?.국가) return null;
              const countryInfo = findCountryInfo(uploadedData[0].국가);
              return countryInfo
                ? {
                    cityNatlCd: countryInfo.cityNatlCd,
                    korNatlNm: countryInfo.displayName,
                  }
                : null;
            }, [uploadedData])}
            userGender={convertGender(uploadedData?.[0]?.성별 || "남")}
            userDateOfBirth={uploadedData?.[0]?.생년월일 || ""}
            companions={useMemo(
              () =>
                uploadedData
                  ? uploadedData.slice(1).map((companion) => ({
                      gender: convertGender(companion.성별),
                      dateOfBirth: companion.생년월일,
                      koreanName: companion["이름(국문)"],
                      englishName: companion["이름(영문)"],
                      email: companion.이메일,
                      phoneNumber: companion["휴대폰 번호"],
                    }))
                  : [],
              [uploadedData, convertGender]
            )}
            koreanName={uploadedData?.[0]?.["이름(국문)"] || ""}
            englishName={uploadedData?.[0]?.["이름(영문)"] || ""}
            email={uploadedData?.[0]?.이메일 || ""}
            phoneNumber={uploadedData?.[0]?.["휴대폰 번호"] || ""}
            isFileUploaded={isFileProcessed && !!uploadedData}
          />
        </div>
      </div>
    </div>
  );
}

export default ExcelUpLoad;
