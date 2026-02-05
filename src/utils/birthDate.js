// utils/birthDate.js
export const formatDateString = (dateString) => {
  const year = dateString.slice(0, 4);
  const month = dateString.slice(4, 6);
  const day = dateString.slice(6, 8);
  return { year, month, day };
};

export const formatKoreanDate = (dateString) => {
  const { year, month, day } = formatDateString(dateString);
  return `${year}년 ${parseInt(month, 10)}월 ${parseInt(day, 10)}일`;
};

export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatPersonalId = (dateOfBirth, gender) => {
  const shortBirthDate = dateOfBirth.slice(2, 8);
  const year = parseInt(dateOfBirth.substring(0, 4));
  const baseCode = year >= 2000 ? 2 : 0;
  const genderCode = (baseCode + parseInt(gender)).toString();
  return `(${shortBirthDate} - ${genderCode}******)`;
};

export const formatBirthDateInput = (value) => {
  return value
    .replace(/[^0-9]/g, "") // 숫자가 아닌 문자 제거
    .replace(/^(\d{4})(\d{2})(\d{2})$/, "$1$2$3"); // YYYYMMDD 형식으로 변환
};

/**
 * YYYYMMDD 형식의 문자열을 Date 객체로 변환
 */
const parseYYYYMMDD = (dateStr) => {
  if (!dateStr || dateStr.length !== 8) {
    return null;
  }

  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10) - 1; // 월은 0부터 시작
  const day = parseInt(dateStr.substring(6, 8), 10);

  const date = new Date(year, month, day);

  // 유효한 날짜인지 검증
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

/**
 * 보험나이 계산 함수 (Excel DATEDIF 함수와 동일한 방식)
 * 만 나이를 계산하고, 생년월일부터 기준일까지의 개월 수가 6개월 이상이면 1세 추가
 * 
 * @param {string} birthDate - 생년월일 (YYYYMMDD 형식의 문자열)
 * @param {string} baseDate - 계산 기준일(부보시기) (YYYYMMDD 형식의 문자열)
 * @returns {number} 보험나이
 */
export const calculateInsuranceAge = (birthDate, baseDate) => {
  // 날짜 문자열을 Date 객체로 변환
  const birthDateObj = parseYYYYMMDD(birthDate);
  const baseDateObj = parseYYYYMMDD(baseDate);

  // 유효한 날짜인지 확인
  if (!birthDateObj || !baseDateObj) {
    console.error('유효하지 않은 날짜 형식입니다.');
    return 0;
  }

  // 만 나이 계산 (Year 차이)
  const yearDiff = baseDateObj.getFullYear() - birthDateObj.getFullYear();

  // 월 차이 계산
  let monthDiff = baseDateObj.getMonth() - birthDateObj.getMonth();

  // 일 차이 계산 - 일자가 작으면 월 차이에서 1 감소
  if (baseDateObj.getDate() < birthDateObj.getDate()) {
    monthDiff--;
  }

  // 월 차이가 음수면 연도에서 1 감소하고 월 차이 조정
  let age = yearDiff;
  if (monthDiff < 0) {
    age--;
    monthDiff += 12;
  }

  // 월 차이가 6개월 이상이면 나이 1 추가
  if (monthDiff >= 6) {
    age++;
  }

  return Math.max(0, age); // 음수 방지
};

/**
 * 만 나이 계산
 * @param {string} birthDate - 생년월일 (YYYYMMDD 형식의 문자열)
 * @param {string} baseDate - 계산 기준일(부보시기) (YYYYMMDD 형식의 문자열)
 * @returns {number} - 만 나이
 */
export const calculateManAge = (birthDate, baseDate) => {
  // 날짜 문자열을 Date 객체로 변환
  const birthDateObj = parseYYYYMMDD(birthDate);
  const baseDateObj = parseYYYYMMDD(baseDate);

  // 유효한 날짜인지 확인
  if (!birthDateObj || !baseDateObj) {
    console.error('유효하지 않은 날짜 형식입니다.');
    return 0;
  }

  // 만 나이 계산
  let age = baseDateObj.getFullYear() - birthDateObj.getFullYear();

  // 생일이 지나지 않았으면 1살 차감
  if (
    baseDateObj.getMonth() < birthDateObj.getMonth() ||
    (baseDateObj.getMonth() === birthDateObj.getMonth() &&
      baseDateObj.getDate() < birthDateObj.getDate())
  ) {
    age--;
  }

  return Math.max(0, age); // 음수 방지
};

/**
 * 오늘 날짜를 YYYYMMDD 형식으로 반환
 */
export const getTodayYYYYMMDD = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}${month}${day}`;
};