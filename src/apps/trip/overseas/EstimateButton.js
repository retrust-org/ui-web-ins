import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useDispatch } from "react-redux";
import { generateAllPlanPDFs } from "../../../utils/pdfUtils";
import { setPDFBlobs, setPriceData } from "../../../redux/store";

const EstimateButton = ({
  startDate,
  endDate,
  selectedCountry,
  userGender,
  userDateOfBirth,
  companions,
  koreanName,
  englishName,
  email,
  phoneNumber,
  isFileUploaded,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const requestMadeRef = useRef(false);
  const dispatch = useDispatch();

  const formatDate = useCallback((date) => {
    return date ? date.replace(/-/g, "") : "";
  }, []);

  const cacheKey = useMemo(() => {
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    return `priceData_${formattedStartDate}_${formattedEndDate}_${selectedCountry?.cityNatlCd}_${userGender}_${userDateOfBirth}_${companions.length}`;
  }, [
    startDate,
    endDate,
    selectedCountry,
    userGender,
    userDateOfBirth,
    companions,
    formatDate,
  ]);

  const hasAllRequiredData = useMemo(() => {
    return !!(
      startDate &&
      endDate &&
      selectedCountry?.cityNatlCd &&
      userGender &&
      userDateOfBirth &&
      koreanName &&
      englishName &&
      email &&
      phoneNumber &&
      isFileUploaded
    );
  }, [
    startDate,
    endDate,
    selectedCountry,
    userGender,
    userDateOfBirth,
    koreanName,
    englishName,
    email,
    phoneNumber,
    isFileUploaded,
  ]);

  const fetchPriceData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    requestMadeRef.current = true;

    try {
      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);

      const inspeInfos = [
        {
          inspeNm: "계약자",
          inspeBdt: userDateOfBirth,
          gndrCd: userGender,
        },
        ...companions.map((companion, index) => ({
          inspeNm: `동반${index + 1}${companion.gender === "2" ? "여" : ""}`,
          inspeBdt: companion.dateOfBirth,
          gndrCd: companion.gender,
        })),
      ];

      const requestBody = {
        insBgnDt: formattedStartDate,
        insEdDt: formattedEndDate,
        natlCd: selectedCountry.cityNatlCd,
        inspeCnt: String(inspeInfos.length),
        inspeInfos: inspeInfos,
      };

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/trip-api/v2/trip/price`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API 오류 (${response.status}): ${errorText}`);
      }

      const result = await response.json();

      // API 응답 데이터를 Redux store에 저장
      dispatch(setPriceData(result));

      // PDF Blob 생성
      const pdfBlobs = await generateAllPlanPDFs({
        priceData: result,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        selectedCountry,
        koreanName,
        englishName,
        email,
        phoneNumber,
        companions,
      });

      // PDF Blobs을 Redux store에 저장
      dispatch(setPDFBlobs(pdfBlobs));

      // 캐시 저장
      sessionStorage.setItem(cacheKey, JSON.stringify(result));
    } catch (error) {
      console.error("처리 중 오류:", error);
      setErrorMessage(`처리 실패: ${error.message}`);
      requestMadeRef.current = false;
    } finally {
      setIsLoading(false);
    }
  }, [
    isFileUploaded,
    hasAllRequiredData,
    startDate,
    endDate,
    selectedCountry,
    userGender,
    userDateOfBirth,
    companions,
    koreanName,
    englishName,
    email,
    phoneNumber,
    formatDate,
    cacheKey,
    dispatch,
  ]);

  useEffect(() => {
    if (isFileUploaded && hasAllRequiredData && !requestMadeRef.current) {
      fetchPriceData();
    }
  }, [isFileUploaded, hasAllRequiredData, fetchPriceData]);

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      {isLoading && (
        <div className="flex items-center gap-2 text-blue-600">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>견적서 생성중...</span>
        </div>
      )}
      {errorMessage && (
        <div className="text-red-500 text-sm font-medium bg-red-50 px-4 py-2 rounded-lg">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default EstimateButton;
