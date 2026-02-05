// 날짜를 yyyy-mm-dd 형태로 포멧터 하는 함수

export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatKoreanDate = (dateString) => {
  if (!dateString) return "-";
  const year = dateString.substring(0, 4);
  const month = parseInt(dateString.substring(4, 6), 10);
  const day = parseInt(dateString.substring(6, 8), 10);
  return `${year}년 ${month}월 ${day}일`;
};
