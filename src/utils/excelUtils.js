// 정규화 함수들
export const normalizeGender = (gender) => {
  if (!gender) return "";
  const genderStr = String(gender).trim();
  if (genderStr === "남") return "1";
  if (genderStr === "여") return "2";
  return genderStr;
};

export const normalizeBirthDate = (birthDate) => {
  if (!birthDate) return "";
  const dateStr = String(birthDate).replace(/[^0-9]/g, "");
  return dateStr.length === 8 ? dateStr : "";
};

// 나이 계산 함수
export const calculateAge = (birthDateStr) => {
  if (!birthDateStr || birthDateStr.length !== 8) return 0;

  const today = new Date();
  const birth = new Date(
    parseInt(birthDateStr.substring(0, 4)),
    parseInt(birthDateStr.substring(4, 6)) - 1,
    parseInt(birthDateStr.substring(6, 8))
  );

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// 데이터 유효성 검증 함수
export const validateUserData = (contractor, companions) => {
  // 계약자 검증
  if (contractor) {
    if (!contractor.birthDate || contractor.birthDate.length !== 8) {
      throw new Error("계약자의 생년월일이 올바르지 않습니다. (YYYYMMDD 형식)");
    }
    if (
      !contractor.gender ||
      (contractor.gender !== "1" && contractor.gender !== "2")
    ) {
      throw new Error("계약자의 성별이 올바르지 않습니다.");
    }
  }

  // 동반자 검증
  for (let i = 0; i < companions.length; i++) {
    const companion = companions[i];
    if (!companion.birthDate || companion.birthDate.length !== 8) {
      throw new Error(
        `동반자 ${i + 1}의 생년월일이 올바르지 않습니다. (YYYYMMDD 형식)`
      );
    }
    if (
      !companion.gender ||
      (companion.gender !== "1" && companion.gender !== "2")
    ) {
      throw new Error(`동반자 ${i + 1}의 성별이 올바르지 않습니다.`);
    }
  }
};

// 국내용 행 파싱 함수
export const parseDomesticRow = (row) => {
  const values = Object.values(row);

  if (values.length >= 3) {
    const [koreanName, birthDate, gender, emailOrPhone, phoneNumber] = values;

    const normalizedBirthDate = normalizeBirthDate(birthDate);
    const normalizedGender = normalizeGender(gender);

    // 4번째 값은 이메일, 5번째 값은 전화번호
    const email = emailOrPhone && String(emailOrPhone).trim()
      ? String(emailOrPhone).trim()
      : "DO_NOT_SEND";

    const phone = phoneNumber && String(phoneNumber).trim()
      ? String(phoneNumber).trim()
      : "";

    return {
      koreanName: String(koreanName || "").trim(),
      englishName: String(koreanName || "").trim(),
      birthDate: normalizedBirthDate,
      gender: normalizedGender,
      email: email,
      phoneNumber: phone,
    };
  }
  return null;
};

// 해외용 행 파싱 함수
export const parseOverseasRow = (row) => {
  const values = Object.values(row);

  if (values.length >= 4) {
    const [koreanName, englishName, birthDate, gender, emailOrPhone, phoneNumber] =
      values;

    const normalizedBirthDate = normalizeBirthDate(birthDate);
    const normalizedGender = normalizeGender(gender);

    // 5번째 값은 이메일, 6번째 값은 전화번호
    const email = emailOrPhone && String(emailOrPhone).trim()
      ? String(emailOrPhone).trim()
      : "DO_NOT_SEND";

    const phone = phoneNumber && String(phoneNumber).trim()
      ? String(phoneNumber).trim()
      : "";

    return {
      koreanName: String(koreanName || "").trim(),
      englishName: String(englishName || "").trim(),
      birthDate: normalizedBirthDate,
      gender: normalizedGender,
      email: email,
      phoneNumber: phone,
    };
  }
  return null;
};

// 유효한 행 필터링 함수
export const filterValidRows = (rows) => {
  return rows.filter((row) => {
    const values = Object.values(row);
    return values.some((val) => val && String(val).trim() !== "");
  });
};

// 사용자 데이터 파싱 함수
export const parseUserData = (jsonData, appType) => {
  const userRows = jsonData.slice(1);
  const validUserRows = filterValidRows(userRows);

  let parseUserRow;
  if (appType === "DOMESTIC") {
    parseUserRow = parseDomesticRow;
  } else {
    parseUserRow = parseOverseasRow;
  }

  const contractor =
    validUserRows.length > 0 ? parseUserRow(validUserRows[0]) : null;
  const companions =
    validUserRows.length > 1
      ? validUserRows
        .slice(1)
        .map((row) => parseUserRow(row))
        .filter(Boolean)
      : [];

  return { contractor, companions };
};

// 면책 데이터 생성 함수
export const createIndemnityData = (contractor, companions) => {
  const totalUsers = (contractor ? 1 : 0) + companions.length;
  const indemnityData = {
    inspeCnt: totalUsers,
    natlCd: null,
    inspeInfos: [],
  };

  if (contractor) {
    indemnityData.inspeInfos.push({
      inspeNm: "계약자",
      inspeBdt: contractor.birthDate,
      gndrCd: contractor.gender,
    });
  }

  companions.forEach((companion, index) => {
    indemnityData.inspeInfos.push({
      inspeNm: `동반${index + 1}`,
      inspeBdt: companion.birthDate,
      gndrCd: companion.gender,
    });
  });

  return indemnityData;
};

// 보험 데이터 생성 함수
export const createInsuranceData = (contractor, companions) => {
  const totalUsers = (contractor ? 1 : 0) + companions.length;

  return {
    totalPeople: totalUsers,
    contractor: contractor
      ? {
        name: contractor.koreanName || "미상",
        age: contractor.birthDate ? calculateAge(contractor.birthDate) : 0,
        gender: contractor.gender === "1" ? "남" : "여",
      }
      : null,
    companions: companions.map((companion) => ({
      name: companion.koreanName || "미상",
      age: companion.birthDate ? calculateAge(companion.birthDate) : 0,
      gender: companion.gender === "1" ? "남" : "여",
    })),
  };
};
