import { useState, useEffect } from "react";
import { useBuildingData } from "./useBuildingData";
import { buildingApiService } from "../services/buildingApiService";

export const useFloorUnitSelect = (contextData) => {
  // Context에서 buildingData를 직접 사용
  const buildingData = contextData?.buildingData;

  const { selectedAddress, loading: buildingLoading, fetchBuildingUnits } =
    useBuildingData(contextData?.buildingData);

  // 면적 API 호출 로딩 상태
  const [areaLoading, setAreaLoading] = useState(false);

  // 통합 로딩 상태
  const loading = buildingLoading || areaLoading;

  // Context에서 선택된 동 정보 가져오기 (DongSelector에서 선택한 동)
  const contextSelectedDong = contextData?.facilityData?.selectedDong;

  // 층, 동, 호실 관련 상태들
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null); // 단층 모드용
  const [selectedFloors, setSelectedFloors] = useState([]); // 여러층 모드용 (배열)
  const [floorSearchText, setFloorSearchText] = useState("");
  const [filteredFloors, setFilteredFloors] = useState([]);

  // 동 선택은 DongSelector에서 처리되므로 FloorSelector에서는 불필요
  // Context에서 선택된 동만 사용

  const [units, setUnits] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [unitSearchText, setUnitSearchText] = useState("");
  const [filteredUnits, setFilteredUnits] = useState([]);

  const [currentStep, setCurrentStep] = useState("floor"); // "floor", "dong", "unit"

  // 여러 층과 호수 선택을 위한 상태 추가
  const [selectedFloorUnits, setSelectedFloorUnits] = useState([]);

  // 층 정보 가져오기 (캐싱된 unifiedApiData 사용)
  const fetchFloorData = async () => {
    if (!buildingData?.unifiedApiData) {
      return;
    }

    try {
      const unifiedData = buildingData.unifiedApiData;

      // 층 목록 추출 (선택된 동 기준으로 필터링)
      const floorList = buildingApiService.getFloorsByDong(unifiedData, contextSelectedDong);

      // 서버에서 이미 가입 가능한 건물만 필터링되어 오므로 모든 층 사용
      if (floorList.length > 0) {
        // 층 정보를 객체로 저장
        const uniqueFloorObjects = [];
        floorList.forEach((floor) => {
          const existingFloor = uniqueFloorObjects.find(
            (f) => f.flrNo === floor.flrNo && f.flrGbCdNm === floor.flrGbCdNm && f.flrGbCd === floor.flrGbCd
          );

          if (!existingFloor) {
            uniqueFloorObjects.push({
              flrNo: floor.flrNo,
              flrGbCdNm: floor.flrGbCdNm,
              flrGbCd: floor.flrGbCd,
              exposes: floor.exposes || [],  // 호수 정보 포함
              area: floor.area || 0  // 층 면적 포함
            });
          }
        });

        // 정렬: 지하 → 지상 → 옥탑 순서, 각 그룹 내에서는 층수 오름차순
        uniqueFloorObjects.sort((a, b) => {
          // 층 타입별 우선순위: 지하(10) < 지상(20) < 옥탑(30)
          const priorityA = a.flrGbCd === "10" ? 1 : a.flrGbCd === "20" ? 2 : 3;
          const priorityB = b.flrGbCd === "10" ? 1 : b.flrGbCd === "20" ? 2 : 3;

          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }

          // 같은 타입 내에서는 층수로 정렬
          return parseInt(a.flrNo) - parseInt(b.flrNo);
        });

        setFloors(uniqueFloorObjects);
        setFilteredFloors(uniqueFloorObjects);
      } else {
        setFloors([]);
        setFilteredFloors([]);
      }
    } catch (err) {
      setFloors([]);
      setFilteredFloors([]);
    }
  };

  // 층 검색 핸들러
  const handleFloorSearch = (e) => {
    const text = e.target.value;
    setFloorSearchText(text);

    setFilteredFloors(
      text.trim() === ""
        ? floors
        : floors.filter((floor) => {
            const floorText =
              floor.flrGbCdNm === "지하"
                ? `지하 ${floor.flrNo}층`
                : `${floor.flrNo}층`;
            return floorText.includes(text.trim());
          })
    );
  };

  // fetchDongsForFloor는 DongSelector에서 동 선택 완료 후 FloorSelector로 오므로 불필요
  // FloorSelector는 층 선택 → 호실 선택만 처리

  // 층에 대한 호실 정보 가져오기 (캐싱된 데이터 사용)
  const fetchUnitsForFloor = async (floor) => {
    if (!buildingData?.unifiedApiData) return;

    try {
      // 해당 층의 호수(exposes) 정보 확인
      // floor 객체에 이미 exposes 정보가 포함되어 있음
      if (floor.exposes && floor.exposes.length > 0) {
        const units = floor.exposes.map((expose) => ({
          dongNm: contextSelectedDong || "",
          hoNm: expose.hoNm || "",
          flrNo: floor.flrNo,
          flrGbCdNm: floor.flrGbCdNm
        }));

        setUnits(units);
        setFilteredUnits(units);
        setCurrentStep("unit"); // 호수가 있을 때만 unit 단계로 이동
      } else {
        setUnits([]);
        setFilteredUnits([]);
        // 호수가 없을 때는 currentStep을 변경하지 않음
        // FloorSelector에서 직접 Result로 이동하도록 처리
      }
    } catch (err) {
      setUnits([]);
      setFilteredUnits([]);
    }
  };

  // 특정 층, 동에 대한 호실 정보 가져오기 (캐싱된 데이터 사용)
  const fetchUnitsForDong = async (floor, dong) => {
    if (!buildingData?.unifiedApiData) return;

    try {
      const unifiedData = buildingData.unifiedApiData;

      // 해당 동의 층 정보 추출
      const floorList = buildingApiService.getFloorsByDong(unifiedData, dong);

      // 선택한 층 찾기
      const targetFloor = floorList.find(f =>
        f.flrNo === floor.flrNo && f.flrGbCdNm === floor.flrGbCdNm
      );

      if (targetFloor && targetFloor.exposes && targetFloor.exposes.length > 0) {
        const units = targetFloor.exposes.map((expose) => ({
          dongNm: dong,
          hoNm: expose.hoNm || "",
          flrNo: floor.flrNo,
          flrGbCdNm: floor.flrGbCdNm
        }));

        setUnits(units);
        setFilteredUnits(units);
      } else {
        setUnits([]);
        setFilteredUnits([]);
      }

      // 호수가 있을 때만 unit 단계로 이동 (exposes: [] 케이스 처리)
      if (targetFloor && targetFloor.exposes && targetFloor.exposes.length > 0) {
        setCurrentStep("unit");
      }
    } catch (err) {
      setUnits([]);
      setFilteredUnits([]);
    }
  };

  // 여러 층의 호실 정보를 동시에 가져오기 (캐싱된 데이터 사용)
  const fetchUnitsForMultipleFloors = async (floors, dong = null) => {
    if (!buildingData?.unifiedApiData) return;

    try {
      const unifiedData = buildingData.unifiedApiData;

      // 모든 선택된 층의 호수를 합치기
      const allUnits = [];

      if (dong) {
        // 동이 있는 경우: 해당 동의 층 정보 추출
        const floorList = buildingApiService.getFloorsByDong(unifiedData, dong);

        floors.forEach((floor) => {
          // 선택한 층 찾기
          const targetFloor = floorList.find(f =>
            f.flrNo === floor.flrNo && f.flrGbCdNm === floor.flrGbCdNm
          );

          if (targetFloor && targetFloor.exposes && targetFloor.exposes.length > 0) {
            const units = targetFloor.exposes.map((expose) => ({
              dongNm: dong || "",
              hoNm: expose.hoNm || "",
              flrNo: floor.flrNo,
              flrGbCdNm: floor.flrGbCdNm
            }));
            allUnits.push(...units);
          }
        });
      } else {
        // 동이 없는 경우: floor 객체에 직접 있는 exposes 사용
        floors.forEach((floor) => {
          if (floor.exposes && floor.exposes.length > 0) {
            const units = floor.exposes.map((expose) => ({
              dongNm: contextSelectedDong || "",
              hoNm: expose.hoNm || "",
              flrNo: floor.flrNo,
              flrGbCdNm: floor.flrGbCdNm
            }));
            allUnits.push(...units);
          }
        });
      }

      setUnits(allUnits);
      setFilteredUnits(allUnits);

      // 호수가 있을 때만 unit 단계로 이동 (exposes: [] 케이스 처리)
      if (allUnits.length > 0) {
        setCurrentStep("unit");
      }
    } catch (err) {
      setUnits([]);
      setFilteredUnits([]);
    }
  };

  // 호실 검색 핸들러
  const handleUnitSearch = (e) => {
    const text = e.target.value;
    setUnitSearchText(text);

    setFilteredUnits(
      text.trim() === ""
        ? units
        : units.filter((unit) => unit.hoNm.toString().includes(text.trim()))
    );
  };

  // 호실 선택 핸들러 (토글만 수행, API 호출 제거)
  const handleUnitSelect = (unit) => {
    // 이미 선택된 호실인지 확인
    const selectedUnit = selectedUnits.find(
      (u) => u.hoNm === unit.hoNm && u.dongNm === unit.dongNm
    );

    if (selectedUnit) {
      // 선택 해제 (토글)
      setSelectedUnits((prev) =>
        prev.filter((u) => !(u.hoNm === unit.hoNm && u.dongNm === unit.dongNm))
      );
    } else {
      // 선택 추가 (area 없이 저장)
      setSelectedUnits((prev) => [...prev, unit]);
    }
  };

  // 선택된 호수들의 면적 API 일괄 호출
  const fetchAreasForSelectedUnits = async () => {
    if (selectedUnits.length === 0) return [];

    const pnu = buildingData?.pnu;
    if (!pnu) {
      console.error("PNU가 없습니다");
      return [];
    }

    setAreaLoading(true);

    try {
      // 동별로 그룹화
      const unitsByDong = selectedUnits.reduce((acc, unit) => {
        const dong = unit.dongNm || "";
        if (!acc[dong]) acc[dong] = [];
        acc[dong].push(unit.hoNm);
        return acc;
      }, {});

      // 동별로 API 호출 (Promise.all로 병렬 처리)
      const promises = Object.entries(unitsByDong).map(([dongNm, hoNms]) => {
        const hoNmParam = hoNms.join(',');
        return buildingApiService.fetchUnitArea(pnu, dongNm, hoNmParam);
      });

      const results = await Promise.all(promises);

      // 각 동의 결과를 selectedUnits에 매핑
      // 첫 번째 결과에서 buildingCost 추출
      const firstResult = Array.isArray(results[0]) ? results[0][0] : results[0];
      const buildingCost = firstResult?.buildingCost || null;

      const unitsWithArea = selectedUnits.map((unit) => {
        // 해당 호수의 API 결과 찾기 (results는 배열)
        const dongResult = results.find(apiResponse => {
          // apiResponse가 배열이면 첫 번째 요소 사용
          const responseData = Array.isArray(apiResponse) ? apiResponse[0] : apiResponse;

          // areas에서 해당 호수 찾기
          return responseData?.areas?.some(a => a.hoNm === unit.hoNm);
        });

        // 배열이면 첫 번째 요소 추출
        const responseData = Array.isArray(dongResult) ? dongResult[0] : dongResult;

        if (responseData?.areas) {
          // 해당 호수의 area 찾기
          const unitArea = responseData.areas.find(a => a.hoNm === unit.hoNm);
          return {
            ...unit,
            area: parseFloat(unitArea?.totalArea) || 0,
            fullNewPlatPlc: responseData.fullNewPlatPlc || "",
            areaDetails: unitArea?.areaDetails || []  // 주택종류 정보 포함
          };
        }

        return {
          ...unit,
          area: 0,
          fullNewPlatPlc: ""
        };
      });

      return { unitsWithArea, buildingCost };
    } catch (error) {
      console.error('면적 조회 실패:', error);
      throw error;
    } finally {
      setAreaLoading(false);
    }
  };

  // 선택한 층과 호수 저장하는 함수
  const addSelectedFloorAndUnits = () => {
    if (selectedFloor && selectedUnits.length > 0) {
      const floorUnitObj = {
        floor: selectedFloor,
        dong: contextSelectedDong || "",  // Context에서 선택된 동 사용
        units: [...selectedUnits],
      };

      // 이미 선택된 층이 있는지 확인 (객체 비교)
      const existingFloorIndex = selectedFloorUnits.findIndex((item) =>
        typeof item.floor === "object" && typeof selectedFloor === "object"
          ? item.floor.flrNo === selectedFloor.flrNo &&
            item.floor.flrGbCdNm === selectedFloor.flrGbCdNm &&
            item.dong === (contextSelectedDong || "")
          : item.floor === selectedFloor && item.dong === (contextSelectedDong || "")
      );

      if (existingFloorIndex >= 0) {
        // 기존 층이 있으면 호수만 업데이트
        const updatedFloorUnits = [...selectedFloorUnits];
        updatedFloorUnits[existingFloorIndex].units = [...selectedUnits];
        setSelectedFloorUnits(updatedFloorUnits);
      } else {
        // 새로운 층이면 추가
        setSelectedFloorUnits((prev) => [...prev, floorUnitObj]);
      }

      // 선택 상태 초기화
      setSelectedUnits([]);
      setSelectedFloor(null);
      setCurrentStep("floor");
    }
  };

  // 저장된 층-호수 항목 제거 함수
  const removeFloorUnit = (floor, dong) => {
    setSelectedFloorUnits((prev) =>
      prev.filter((item) => {
        // 객체 비교
        if (typeof item.floor === "object" && typeof floor === "object") {
          return !(
            item.floor.flrNo === floor.flrNo &&
            item.floor.flrGbCdNm === floor.flrGbCdNm &&
            item.dong === dong
          );
        }
        // 문자열 비교 (이전 방식 호환성)
        return !(item.floor === floor && item.dong === dong);
      })
    );
  };

  // 빌딩 데이터가 변경될 때마다 층 정보 가져오기
  useEffect(() => {
    if (buildingData?.unifiedApiData) {
      fetchFloorData();
    }
  }, [buildingData?.unifiedApiData, contextSelectedDong]);

  return {
    loading,
    floors,
    selectedFloor,
    setSelectedFloor,
    selectedFloors,
    setSelectedFloors,
    floorSearchText,
    filteredFloors,
    handleFloorSearch,
    units,
    selectedUnits,
    setSelectedUnits,
    unitSearchText,
    filteredUnits,
    handleUnitSearch,
    handleUnitSelect,
    fetchUnitsForFloor,
    fetchUnitsForDong,
    fetchUnitsForMultipleFloors,
    fetchAreasForSelectedUnits,  // 추가
    currentStep,
    setCurrentStep,
    selectedFloorUnits,
    setSelectedFloorUnits,
    addSelectedFloorAndUnits,
    removeFloorUnit,
  };
};
