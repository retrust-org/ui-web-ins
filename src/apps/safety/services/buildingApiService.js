const REACT_APP_BASE_URL = process.env.REACT_APP_BASE_URL;

export const buildingApiService = {
  /**
   * PNU(부동산고유번호) 생성
   * @param {string} admCd - 행정구역코드 (10자리)
   * @param {string} lnbrMnnm - 본번
   * @param {string} lnbrSlno - 부번
   * @param {string} mtYn - 산 여부 (0: 대지, 1: 산)
   * @returns {string} 19자리 PNU
   */
  constructPNU(admCd, lnbrMnnm, lnbrSlno, mtYn) {
    const sigunguCd = admCd.substring(0, 5).padStart(5, "0");
    const bjdongCd = admCd.substring(5, 10).padStart(5, "0");
    const platGbCd = mtYn || "0";
    const bun = lnbrMnnm.padStart(4, "0");
    const ji = lnbrSlno.padStart(4, "0");

    return `${sigunguCd}${bjdongCd}${platGbCd}${bun}${ji}`;
  },

  /**
   * 통합 Building API 호출
   * @param {string} pnu - 19자리 PNU
   * @param {string|null} productCd - 상품코드 (주택풍수해: 17604, 소상공인: 17605)
   * @param {boolean|null} isHanok - 한옥 여부 (true: 한옥, false: 일반)
   * @returns {Promise<Object>} 통합 API 응답 데이터
   */
  async fetchUnifiedBuildingInfo(pnu, productCd = null, isHanok = null) {
    let url = `${REACT_APP_BASE_URL}/disaster-api/api/v3/building/info?pnu=${pnu}`;

    // productCd가 있으면 쿼리 파라미터 추가
    if (productCd) {
      url += `&productCd=${productCd}`;
    }

    // isHanok이 지정되면 쿼리 파라미터 추가
    if (isHanok !== null) {
      url += `&isHanok=${isHanok}`;
    }

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "건물 정보를 불러오는데 오류가 발생했습니다. 다시 시도해주세요.");
      }

      // titles 정보 콘솔 출력 (주택풍수해 디버깅용)
      if (productCd === "17604") {
        const titles = data.data?.registryInfo?.titles || [];
        if (titles.length > 0) {
          console.log("=== Building Titles Info (주택풍수해) ===");
          titles.forEach((title, index) => {
            console.log(`[${index}] mainPurpsCd: ${title.mainPurpsCd}, mainPurpsCdNm: ${title.mainPurpsCdNm}, bldNm: ${title.bldNm}`);
          });
        }
      }

      return data;
    } catch (error) {
      console.error("fetchUnifiedBuildingInfo error:", error);
      throw error;
    }
  },

  /**
   * 통합 API 응답을 기존 titleInfo 구조로 변환
   * @param {Object} unifiedData - 통합 API 응답
   * @param {Object} specificTitle - (선택) 특정 title 객체 (동 지정 시)
   * @returns {Object} 기존 titleInfo 형식의 데이터
   */
  transformToLegacyTitleInfo(unifiedData, specificTitle = null) {
    const addressInfo = unifiedData.data.addressInfo;
    const recapTitles = unifiedData.data.registryInfo.recapTitles || [];
    const titles = unifiedData.data.registryInfo.titles || [];

    // specificTitle이 제공되면 그것을 사용, 아니면 recapTitles 우선, 없으면 titles[0] 사용
    const source = specificTitle || (recapTitles.length > 0 ? recapTitles[0] : titles[0]);

    return {
      sigunguCd: addressInfo.sigunguCd,
      bjdongCd: addressInfo.bjdongCd,
      bun: addressInfo.bun,
      ji: addressInfo.ji,
      grndFlrCnt: source?.grndFlrCnt || 0,
      ugrndFlrCnt: source?.ugrndFlrCnt || 0,
      totArea: addressInfo.totArea || source?.totDongTotArea || 0,
      etcStrct: source?.etcStrct || "",
      etcRoof: source?.etcRoof || "",
      roofCdNm: source?.roofCdNm || "",
      regstrGbCdNm: addressInfo.regstrGbCdNm,
      mainPurpsCdNm: addressInfo.mainPurpsCdNm
    };
  },

  /**
   * 통합 API 응답을 기존 buildingUnits 구조로 변환
   * @param {Object} unifiedData - 통합 API 응답
   * @returns {Object} 기존 buildingUnits 형식의 데이터
   */
  transformToLegacyBuildingUnits(unifiedData) {
    const items = [];
    const titles = unifiedData.data.registryInfo.titles || [];

    titles.forEach(title => {
      const dongNm = title.dongNm?.trim() || "";

      title.floors?.forEach(floor => {
        if (floor.exposes?.length > 0) {
          // 호수 있음
          floor.exposes.forEach(expose => {
            items.push({
              dongNm,
              flrNo: floor.flrNo,
              flrGbCd: floor.flrGbCd,
              flrGbCdNm: floor.flrGbCdNm,
              hoNm: expose.hoNm,
              area: floor.area,
              etcStrct: floor.etcStrct
            });
          });
        } else {
          // 호수 없음 (단독주택 등)
          items.push({
            dongNm,
            flrNo: floor.flrNo,
            flrGbCd: floor.flrGbCd,
            flrGbCdNm: floor.flrGbCdNm,
            hoNm: "",
            area: floor.area,
            etcStrct: floor.etcStrct
          });
        }
      });
    });

    return {
      errCd: "00001",
      response: {
        body: {
          items: {
            item: items
          }
        }
      }
    };
  },

  /**
   * 동(Dong) 목록 추출
   * @param {Object} unifiedData - 통합 API 응답
   * @param {Object} options - 옵션 객체
   * @param {boolean} options.mainBuildingOnly - 주건축물만 필터링 여부 (기본값: false)
   * @returns {Array<string>} 동 목록
   */
  getDongList(unifiedData, options = {}) {
    const { mainBuildingOnly = false } = options;
    const titles = unifiedData.data.registryInfo.titles || [];
    const dongSet = new Set();

    // titles에서 동 이름 추출 (dongNm → bldNm → mainAtchGbCdNm 순서로 fallback)
    titles.forEach(title => {
      // mainBuildingOnly가 true면 주건축물만 필터링
      if (mainBuildingOnly && title.mainAtchGbCdNm !== "주건축물") {
        return;
      }

      const dongName = title.dongNm?.trim() || title.bldNm?.trim() || title.mainAtchGbCdNm?.trim();
      if (dongName) {
        dongSet.add(dongName);
      }
    });

    const uniqueDongs = Array.from(dongSet);

    // 숫자 기준 정렬
    return uniqueDongs.sort((a, b) => {
      const numA = parseInt(a.replace(/[^0-9]/g, "")) || 0;
      const numB = parseInt(b.replace(/[^0-9]/g, "")) || 0;
      return numA - numB;
    });
  },

  /**
   * 동(Dong) 존재 여부 확인
   * @param {Object} unifiedData - 통합 API 응답
   * @returns {boolean} 동이 있으면 true, 없으면 false
   */
  hasDongs(unifiedData) {
    const titleCnt = unifiedData.data.registryInfo.titleCnt || 0;

    // 표제부가 2개 이상이면 동 존재
    return titleCnt > 1;
  },

  /**
   * 층(Floor) 목록 추출 (동 필터링)
   * @param {Object} unifiedData - 통합 API 응답
   * @param {string|null} dongNm - 필터링할 동 이름 (null이면 전체)
   * @returns {Array<Object>} 층 목록
   */
  getFloorsByDong(unifiedData, dongNm = null) {
    const titles = unifiedData?.data?.registryInfo?.titles || [];
    const floors = [];

    // dongNm이 공백 문자열인 경우 null로 처리
    const normalizedDongNm = dongNm?.trim?.() || null;

    titles.forEach((title) => {
      // 동 이름 추출 (dongNm → bldNm → mainAtchGbCdNm 순서로 fallback)
      const titleDongName = title.dongNm?.trim() || title.bldNm?.trim() || title.mainAtchGbCdNm?.trim();
      // dongNm이 null이거나 일치하는 경우만
      const shouldInclude = !normalizedDongNm || titleDongName === normalizedDongNm;

      if (shouldInclude) {
        title.floors?.forEach(floor => {
          floors.push({
            flrNo: floor.flrNo,
            flrGbCd: floor.flrGbCd,
            flrGbCdNm: floor.flrGbCdNm,
            area: floor.area,
            exposes: floor.exposes || [],
            etcStrct: floor.etcStrct,
            purposeInfos: floor.purposeInfos || []
          });
        });
      }
    });

    return floors;
  },

  /**
   * 특정 층의 면적 추출
   * @param {Object} unifiedData - 통합 API 응답
   * @param {number} flrNo - 층 번호
   * @param {string} flrGbCdNm - 층 구분명 ("지상" or "지하")
   * @param {string|null} dongNm - 동 이름 (선택)
   * @returns {number} 층 면적
   */
  getFloorArea(unifiedData, flrNo, flrGbCdNm, dongNm = null) {
    const titles = unifiedData.data.registryInfo.titles || [];
    const normalizedDongNm = dongNm?.trim() || null;

    for (const title of titles) {
      // 동 이름 추출 (dongNm → bldNm → mainAtchGbCdNm 순서로 fallback)
      const titleDongName = title.dongNm?.trim() || title.bldNm?.trim() || title.mainAtchGbCdNm?.trim();
      if (normalizedDongNm && titleDongName !== normalizedDongNm) continue;

      const floor = title.floors?.find(f =>
        f.flrNo === flrNo && f.flrGbCdNm === flrGbCdNm
      );

      if (floor) return floor.area || 0;
    }

    return 0;
  },

  /**
   * 개별 호실 면적 조회 API 호출
   * @param {string} pnu - 19자리 PNU
   * @param {string} dongNm - 동 이름 (예: "101동")
   * @param {string} hoNm - 호수 (예: "101호")
   * @returns {Promise<number>} 호실 면적 (전유 + 공용 면적 합산)
   */
  async fetchUnitArea(pnu, dongNm, hoNm) {
    try {
      // dongNm은 API에서 온 값 그대로 사용 (예: "209")
      const url = `${REACT_APP_BASE_URL}/disaster-api/api/v1/building/area?pnu=${pnu}&dongNm=${encodeURIComponent(dongNm)}&hoNm=${encodeURIComponent(hoNm)}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!data.success) {
        console.error("fetchUnitArea failed:", data.message);
        return 0;
      }

      // areas 배열의 모든 항목을 합산 (전유 + 공용)
      const areas = data.data?.areas || [];
      const totalArea = data.data?.totalArea || areas.reduce((sum, item) => {
        return sum + (parseFloat(item.area) || 0);
      }, 0);

      // fullNewPlatPlc 추출
      const fullNewPlatPlc = data.data?.fullNewPlatPlc || "";

      // buildingCost 추출
      const buildingCost = data.data?.buildingCost || null;

      // 전체 데이터 반환
      return {
        totalArea,
        fullNewPlatPlc,
        areas,
        buildingCost
      };
    } catch (error) {
      console.error("fetchUnitArea error:", error);
      return 0;
    }
  },

  /**
   * 선택된 층/호수들의 총 면적 계산
   * @param {Object} unifiedData - 통합 API 응답
   * @param {Array<Object>} selectedFloorUnits - 선택된 층/호수 배열
   * @returns {number} 총 면적
   */
  calculateTotalArea(unifiedData, selectedFloorUnits) {
    let totalArea = 0;

    selectedFloorUnits.forEach(floorUnit => {
      // 호실이 있는 경우 - 각 호실의 area를 합산
      if (floorUnit.units && floorUnit.units.length > 0) {
        floorUnit.units.forEach(unit => {
          const unitArea = parseFloat(unit.area) || 0;
          totalArea += unitArea;
        });
      } else {
        // 호실이 없는 경우 (단독주택, 주차장 등) - 층 전체 면적 사용
        // floor.area가 있으면 직접 사용, 없으면 API에서 조회
        const area = floorUnit.floor.area || this.getFloorArea(
          unifiedData,
          floorUnit.floor.flrNo,
          floorUnit.floor.flrGbCdNm,
          floorUnit.dong
        );
        totalArea += area;
      }
    });

    return totalArea;
  },

  /**
   * 내진설계 여부 추출 및 매핑
   * @param {Object} unifiedData - 통합 API 응답
   * @returns {string} 내진설계 여부 (1: 예, 2: 아니요)
   */
  getEarthquakeResistantDesign(unifiedData) {
    const titles = unifiedData.data?.registryInfo?.titles || [];

    if (titles.length === 0) {
      return "2"; // 기본값: 아니요
    }

    const rserthqkDsgnApplyYn = titles[0].rserthqkDsgnApplyYn;

    // API 값 매핑: "1" (적용) → "1" (예), "0" (미적용) → "2" (아니요)
    if (rserthqkDsgnApplyYn === "1") {
      return "1"; // 예
    } else {
      return "2"; // 아니요 (기본값 포함)
    }
  },

  /**
   * 여러 동의 총 면적 계산
   * @param {Object} unifiedData - 통합 API 응답
   * @param {Array<string>} dongArray - 선택된 동 목록 배열
   * @returns {number} 선택된 동들의 총 면적 합계
   */
  getTotalAreaForDongs(unifiedData, dongArray) {
    const titles = unifiedData.data?.registryInfo?.titles || [];
    let totalArea = 0;

    titles.forEach(title => {
      // 동 이름 추출 (dongNm → bldNm → mainAtchGbCdNm 순서로 fallback)
      const dongNm = title.dongNm?.trim() || title.bldNm?.trim() || title.mainAtchGbCdNm?.trim() || "";

      // 선택된 동 목록에 포함된 경우에만 면적 합산
      if (dongArray.includes(dongNm)) {
        const dongArea = title.totDongTotArea || 0;
        totalArea += parseFloat(dongArea);
      }
    });

    return totalArea;
  },

  /**
   * 여러건물전체 선택 시 모든 동의 건물등급을 비교하여 가장 낮은 등급 반환
   * @param {Object} unifiedData - 통합 API 응답
   * @returns {string} 가장 낮은 건물등급 (1-4, 숫자가 클수록 낮은 등급)
   */
  getLowestFireGradeForAllBuildings(unifiedData) {
    const titles = unifiedData.data?.registryInfo?.titles || [];

    // 모든 동의 fireGrade 수집
    const fireGrades = titles
      .map(title => title.fireGrade)
      .filter(grade => grade != null && grade !== ""); // null, undefined, 빈 문자열 제외

    if (fireGrades.length === 0) {
      return ""; // 등급 정보가 없으면 빈 문자열 반환
    }

    // 숫자로 변환하여 최댓값(가장 낮은 등급) 찾기
    // 건물등급: 1등급(최고) < 2등급 < 3등급 < 4등급(최저)
    const numericGrades = fireGrades.map(grade => parseInt(grade, 10));
    const lowestGrade = Math.max(...numericGrades);

    return lowestGrade.toString();
  },

  /**
   * 여러건물전체 선택 시 가장 낮은 등급을 가진 동의 상세 정보 반환
   * @param {Object} unifiedData - 통합 API 응답
   * @returns {Object|null} 가장 낮은 등급을 가진 동의 title 객체
   */
  getLowestGradeBuildingInfo(unifiedData) {
    const titles = unifiedData.data?.registryInfo?.titles || [];

    // fireGrade가 있는 동들만 필터링
    const validTitles = titles.filter(title =>
      title.fireGrade != null && title.fireGrade !== ""
    );

    if (validTitles.length === 0) {
      return null;
    }

    // 가장 낮은 등급(숫자가 큰 것) 찾기
    let lowestGradeTitle = validTitles[0];
    let lowestGrade = parseInt(validTitles[0].fireGrade, 10);

    validTitles.forEach(title => {
      const grade = parseInt(title.fireGrade, 10);
      if (grade > lowestGrade) {
        lowestGrade = grade;
        lowestGradeTitle = title;
      }
    });

    return lowestGradeTitle;
  }
};
