// utils/formatPrice.js

// 기존 포맷터 유지
export const formatPrice = (price) => {
  if (!price && price !== 0) return "";
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const formatStringPrice = (price) => {
  if (!price && price !== 0) return "";
  const priceStr = price.toString();

  // 숫자만 추출 (소수점 포함)
  const cleanedStr = priceStr.replace(/[^0-9.]/g, "");
  const parts = cleanedStr.split(".");
  const integerPart = parts[0] || "정수처리실패";
  const numericPrice = parseInt(integerPart);
  return numericPrice.toLocaleString();
};
// 새로운 포맷터
export const formatPriceWithComma = (price) => {
  // null, undefined, 빈 문자열 체크
  if (!price && price !== 0) return "";

  // 문자열로 변환 후 숫자만 추출
  const numStr = price.toString().replace(/[^0-9]/g, "");

  // 숫자가 없는 경우 빈 문자열 반환
  if (!numStr) return "";

  // 천단위 구분자 추가
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// utils/formatKoreanPrice.js

export const formatKoreanPrice = (price) => {
  if (!price && price !== 0) return "";

  // 문자열에서 숫자만 추출
  const numStr = price.toString().replace(/[^0-9.]/g, "");
  const num = parseInt(numStr);

  if (isNaN(num)) return "";

  const units = ["", "만", "억", "조"];
  let result = "";
  let unitIndex = 0;
  let tempNum = num;

  while (tempNum > 0) {
    const portion = tempNum % 10000;
    if (portion > 0) {
      result = `${portion}${units[unitIndex]}${result ? " " : ""}${result}`;
    }
    tempNum = Math.floor(tempNum / 10000);
    unitIndex++;
  }

  // 0인 경우 처리
  if (!result) return "0";

  return result;
};

// 금액 포맷터 예시:
// formatKoreanPrice(30000000) => "3천만"
// formatKoreanPrice(234567890) => "2억 3456만 7890"

export const formatKoreanPriceSimple = (price) => {
  if (!price && price !== 0) return "";

  const numStr = price.toString().replace(/[^0-9.]/g, "");
  const num = parseInt(numStr);

  if (isNaN(num)) return "";

  // 1억 이상
  if (num >= 100000000) {
    const uk = Math.floor(num / 100000000);
    const man = Math.floor((num % 100000000) / 10000);
    if (man > 0) {
      return `${uk}억 ${man}만`;
    }
    return `${uk}억`;
  }

  // 1만 이상
  if (num >= 10000) {
    const man = Math.floor(num / 10000);
    return `${man}만`;
  }

  // 1만 미만
  return num.toString();
};
