// regex.js
export const isValidPhone = (phoneNumber) => {
  const regex = /^01[0-9]-[0-9]{3,4}-[0-9]{4}$/;
  return regex.test(phoneNumber);
};

export const isValidEmail = (email) => {
  const regex =
    /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
  return regex.test(email);
};

export const isValidKoreanName = (name) => {
  const koreanRegex = /^[가-힣]+$/;
  return koreanRegex.test(name);
};

export const formatEnglishName = (value) => {
  return value.replace(/[^a-zA-Z\s]/g, "").toUpperCase();
};

export const formatPhoneNumber = (value) => {
  return value
    .replace(/[^0-9]/g, "")
    .replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, "$1-$2-$3")
    .replace(/-{1,2}$/g, "");
};

export const formatEmail = (value) => {
  return value.replace(/[^a-zA-Z0-9@._%+-]/g, "");
};


export const getGenderCode = (birth, gender, isForeigner = false) => {
  const year = parseInt(birth.substring(0, 4));
  const baseCode = year >= 2000 ? 2 : 0;
  const foreignerCode = isForeigner ? 4 : 0;

  return (baseCode + foreignerCode + parseInt(gender)).toString();
};

export const isAllFieldsEmpty = (fields) => {
  return Object.values(fields).every((value) => !value.trim());
};
