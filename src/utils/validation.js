import { isValidPhone, isValidEmail, isValidKoreanName } from "./regex";

// 영어 이름 유효성 검사 함수 추가
const isValidEnglishName = (name) => {
  // 영어 알파벳과 공백만 허용 (대소문자 구분 없음)
  const englishNameRegex = /^[a-zA-Z\s]+$/;
  return englishNameRegex.test(name);
};

// 기존 검증 함수들 - 이름 검증 수정
export const validateName = (name) => {
  let error = "";
  if (!name) {
    error = "이름을 입력해주세요.";
  } else if (!name.trim()) {
    error = "이름을 입력해주세요.";
  } else if (!isValidKoreanName(name) && !isValidEnglishName(name)) {
    error = "올바른 한글 또는 영문 이름을 입력해주세요.";
  }
  return error;
};

export const validateEnglishName = (englishName) => {
  let error = "";
  if (!englishName) {
    error = "영문 이름을 입력해주세요.";
  } else if (!englishName.trim()) {
    error = "영문 이름을 입력해주세요.";
  }
  return error;
};

export const validatePhoneNumber = (phoneNumber) => {
  let error = "";
  if (!phoneNumber) {
    error = "전화번호를 입력해주세요.";
  } else if (!phoneNumber.trim()) {
    error = "전화번호를 입력해주세요.";
  } else if (!isValidPhone(phoneNumber)) {
    error = "유효하지 않은 전화번호입니다!";
  }
  return error;
};

export const validateEmail = (email) => {
  let error = "";

  // DO_NOT_SEND는 유효한 값으로 처리
  if (email === "DO_NOT_SEND") {
    return "";
  }

  if (!email) {
    error = "이메일을 입력해주세요.";
  } else if (!email.trim()) {
    error = "이메일을 입력해주세요.";
  } else if (!isValidEmail(email)) {
    error = "유효하지 않은 이메일 주소입니다.";
  }
  return error;
};

// 단일 사용자 폼 검증
export const validateUserForm = (values) => {
  // values가 undefined 또는 null인 경우 처리
  if (!values) {
    return {
      isValid: false,
      errors: {
        name: "이름을 입력해주세요.",
        phoneNumber: "전화번호를 입력해주세요.",
        email: "이메일을 입력해주세요.",
      },
    };
  }

  const { name, phoneNumber, email, englishName } = values;

  const errors = {
    name: validateName(name),
    phoneNumber: validatePhoneNumber(phoneNumber),
    email: validateEmail(email),
  };

  // englishName이 포함된 경우에만 검증
  if (englishName !== undefined) {
    errors.englishName = validateEnglishName(englishName);
  }

  const isValid = !Object.values(errors).some((error) => error !== "");
  return { isValid, errors };
};

// 동반인 폼 검증
export const validateCompanionForms = (members) => {
  // members가 undefined 또는 null인 경우 처리
  if (!members || !Array.isArray(members)) {
    return {
      isValid: false,
      errors: [],
    };
  }

  const errors = members.map((member) => {
    // member가 undefined 또는 null인 경우 처리
    if (!member) {
      return {
        name: "이름을 입력해주세요.",
        phoneNumber: "전화번호를 입력해주세요.",
        email: "이메일을 입력해주세요.",
      };
    }

    const { name, phoneNumber, email, englishName } = member;

    const memberErrors = {
      name: validateName(name),
      phoneNumber: validatePhoneNumber(phoneNumber),
      email: validateEmail(email),
    };

    // englishName이 포함된 경우에만 검증
    if (englishName !== undefined) {
      memberErrors.englishName = validateEnglishName(englishName);
    }

    return memberErrors;
  });

  const isValid = !errors.some((error) =>
    Object.values(error).some((fieldError) => fieldError !== "")
  );

  return { isValid, errors };
};

// 날짜 유효성 기본 체크
const isValidDate = (dateString) => {
  if (!dateString) return false;

  const year = parseInt(dateString.substring(0, 4), 10);
  const month = parseInt(dateString.substring(4, 6), 10);
  const day = parseInt(dateString.substring(6, 8), 10);

  // 년도가 1900년 이전이면 유효하지 않음
  if (year < 1900) {
    return false;
  }

  // 월 체크
  if (month < 1 || month > 12) {
    return false;
  }

  // 해당 월의 마지막 날짜 구하기
  const maxDay = new Date(year, month, 0).getDate();
  if (day < 1 || day > maxDay) {
    return false;
  }

  // 미래 날짜 체크 (한국 시간 기준)
  const today = new Date();
  const koreaToday = new Date(today.getTime() + 9 * 60 * 60 * 1000); // UTC+9
  const inputDate = new Date(year, month - 1, day);

  // 미래 날짜라면 유효하지 않음
  if (inputDate > koreaToday) {
    return false;
  }

  return true; // 날짜가 유효함
};

// 나이 계산 함수
export const calculateAge = (dateString) => {
  if (!dateString) return 0;

  const year = parseInt(dateString.substring(0, 4), 10);
  const month = parseInt(dateString.substring(4, 6), 10);
  const day = parseInt(dateString.substring(6, 8), 10);

  // 한국 시간으로 변환
  const today = new Date();
  const utc = today.getTime() + today.getTimezoneOffset() * 60000; // UTC로 변환
  const koreaToday = new Date(utc + 9 * 60 * 60 * 1000); // UTC+9
  const birthDate = new Date(year, month - 1, day);

  let age = koreaToday.getFullYear() - birthDate.getFullYear();
  const monthDiff = koreaToday.getMonth() - birthDate.getMonth();
  const dayDiff = koreaToday.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }
  return age;
};

// 국내여행보험 - 가입자 나이 제한 메시지 반환 함수 (69세)
export const getContractorAgeMessage = (dateString) => {
  if (!dateString || dateString.length !== 8)
    return "생년월일 8자리를 올바르게 입력해주세요";

  const validFormat = /^\d{8}$/;
  if (!validFormat.test(dateString)) {
    return "생년월일 8자리를 올바르게 입력해주세요";
  }

  if (!isValidDate(dateString)) {
    return "올바른 생년월일을 입력해주세요";
  }

  const age = calculateAge(dateString);
  if (age < 19) {
    return "친권자의 동의가 필요합니다";
  }

  if (age > 79) {
    return "만 80세 이상의 경우 가입이 불가합니다";
  }

  return "";
};

// 국내여행보험 - 동반인 나이 제한 메시지 반환 함수 (69세)
export const getCompanionAgeMessage = (dateString) => {
  if (!dateString || dateString.length !== 8)
    return "생년월일 8자리를 올바르게 입력해주세요";

  const validFormat = /^\d{8}$/;
  if (!validFormat.test(dateString)) {
    return "생년월일 8자리를 올바르게 입력해주세요";
  }

  if (!isValidDate(dateString)) {
    return "올바른 생년월일을 입력해주세요";
  }

  const age = calculateAge(dateString);
  if (age < 0) {
    return "0세 이상 가입 가능합니다";
  }

  if (age > 79) {
    return "만 80세 이상의 경우 가입이 불가합니다";
  }

  return "";
};

// 해외여행보험 - 가입자 나이 제한 메시지 반환 함수 (79세)
export const getOverseasContractorAgeMessage = (dateString) => {
  if (!dateString || dateString.length !== 8)
    return "생년월일 8자리를 올바르게 입력해주세요";

  const validFormat = /^\d{8}$/;
  if (!validFormat.test(dateString)) {
    return "생년월일 8자리를 올바르게 입력해주세요";
  }

  if (!isValidDate(dateString)) {
    return "올바른 생년월일을 입력해주세요";
  }

  const age = calculateAge(dateString);
  if (age < 19) {
    return "친권자의 동의가 필요합니다";
  }

  if (age > 79) {
    return "만 80세 이상의 경우 가입이 불가합니다";
  }

  return "";
};

// 해외여행보험 - 동반인 나이 제한 메시지 반환 함수 (79세)
export const getOverseasCompanionAgeMessage = (dateString) => {
  if (!dateString || dateString.length !== 8)
    return "생년월일 8자리를 올바르게 입력해주세요";

  const validFormat = /^\d{8}$/;
  if (!validFormat.test(dateString)) {
    return "생년월일 8자리를 올바르게 입력해주세요";
  }

  if (!isValidDate(dateString)) {
    return "올바른 생년월일을 입력해주세요";
  }

  const age = calculateAge(dateString);
  if (age < 0) {
    return "0세 이상 가입 가능합니다";
  }

  if (age > 79) {
    return "만 80세 이상의 경우 가입이 불가합니다";
  }

  return "";
};

// 국내여행보험 검증 함수들
export const validateContractorDateOfBirth = (dateString) => {
  return !getContractorAgeMessage(dateString);
};

export const validateCompanionDateOfBirth = (dateString) => {
  return !getCompanionAgeMessage(dateString);
};

// 해외여행보험 검증 함수들
export const validateOverseasContractorDateOfBirth = (dateString) => {
  return !getOverseasContractorAgeMessage(dateString);
};

export const validateOverseasCompanionDateOfBirth = (dateString) => {
  return !getOverseasCompanionAgeMessage(dateString);
};

// 국내여행보험 폼 검증
export const validateInsertForm = ({
  startDate,
  endDate,
  gender,
  dateOfBirth,
  companions,
}) => {
  // 입력값 검증
  if (!startDate || !endDate || startDate > endDate) {
    return "올바른 여행날짜를 선택해주세요!";
  }

  if (!gender) {
    return "성별을 선택해주세요!";
  }

  if (!dateOfBirth) {
    return "생년월일을 입력해주세요!";
  }

  const message = getContractorAgeMessage(dateOfBirth);
  if (message) {
    return message;
  }

  // 동반인 검증
  if (companions && Array.isArray(companions)) {
    for (let i = 0; i < companions.length; i++) {
      const companion = companions[i];

      // companion이 undefined 또는 null인 경우 처리
      if (!companion) {
        return `동반인 ${i + 1}의 정보가 유효하지 않습니다`;
      }

      if (!companion.gender) {
        return `동반인 ${i + 1}의 성별을 선택해주세요`;
      }

      if (!companion.dateOfBirth) {
        return `동반인 ${i + 1}의 생년월일을 입력해주세요`;
      }

      const companionMessage = getCompanionAgeMessage(companion.dateOfBirth);
      if (companionMessage) {
        return `동반인 ${i + 1}의 ${companionMessage}`;
      }
    }
  }

  return "";
};

// 해외여행보험 폼 검증
export const validateOverseasInsertForm = ({
  startDate,
  endDate,
  gender,
  dateOfBirth,
  companions,
}) => {
  // 입력값 검증
  if (!startDate || !endDate || startDate > endDate) {
    return "올바른 여행날짜를 선택해주세요!";
  }

  if (!gender) {
    return "성별을 선택해주세요!";
  }

  if (!dateOfBirth) {
    return "생년월일을 입력해주세요!";
  }

  const message = getOverseasContractorAgeMessage(dateOfBirth);
  if (message) {
    return message;
  }

  // 동반인 검증
  if (companions && Array.isArray(companions)) {
    for (let i = 0; i < companions.length; i++) {
      const companion = companions[i];

      // companion이 undefined 또는 null인 경우 처리
      if (!companion) {
        return `동반인 ${i + 1}의 정보가 유효하지 않습니다`;
      }

      if (!companion.gender) {
        return `동반인 ${i + 1}의 성별을 선택해주세요`;
      }

      if (!companion.dateOfBirth) {
        return `동반인 ${i + 1}의 생년월일을 입력해주세요`;
      }

      const companionMessage = getOverseasCompanionAgeMessage(
        companion.dateOfBirth
      );
      if (companionMessage) {
        return `동반인 ${i + 1}의 ${companionMessage}`;
      }
    }
  }

  return "";
};
