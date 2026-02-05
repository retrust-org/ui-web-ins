import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./App.css";
import { Provider } from "react-redux";
import store from "./redux/store";
import { BrowserRouter } from "react-router-dom";
import TagManager from "react-gtm-module";
import BrowserSelector from "./components/common/BrowserSelector";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { PartnerProvider } from "./context/PartnerContext";
import { createContext, useState, useContext } from "react";
import { setAppType } from "./redux/store";

// GTM 설정
const tagManagerArgs = {
  gtmId: process.env.REACT_APP_GTM_ID,
};
TagManager.initialize(tagManagerArgs);

// 전역 데이터 객체
window.productApiData = null;

// ReOrder 사용자 정보를 위한 컨텍스트 생성
export const ReOrderContext = createContext(null);

// ProductInfo 캐싱 로직 - SessionStorage 기반
window.fetchProductInfo = (() => {
  let pendingRequests = new Map(); // 동시 요청 방지용

  return async (productCd) => {
    if (!productCd) return null;

    const sessionKey = `productInfo_${productCd}`;

    // 1. SessionStorage에서 캐시 확인
    try {
      const cachedData = sessionStorage.getItem(sessionKey);
      if (cachedData) {
        const result = JSON.parse(cachedData);
        window.productApiData = result; // 기존 전역 변수 유지
        return result;
      }
    } catch (error) {
      console.warn("SessionStorage 캐시 읽기 실패:", error);
      // 손상된 캐시 데이터 제거
      try {
        sessionStorage.removeItem(sessionKey);
      } catch (removeError) {
        console.warn("손상된 캐시 제거 실패:", removeError);
      }
    }

    // 2. 동시 요청 방지 - 이미 진행 중인 요청이 있으면 대기
    if (pendingRequests.has(productCd)) {
      return pendingRequests.get(productCd);
    }

    // 3. 새로운 API 요청
    const requestPromise = (async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/trip-api/api/v3/trip/master-policies?product_cd=${productCd}&is_active=true`
        );

        if (!response.ok) {
          throw new Error(`API 응답 오류: ${response.status}`);
        }

        const result = await response.json();

        // 4. SessionStorage에 캐시 저장
        try {
          sessionStorage.setItem(sessionKey, JSON.stringify(result));
        } catch (storageError) {
          console.warn("SessionStorage 저장 실패:", storageError);
          // 저장 실패해도 API 결과는 반환
        }

        window.productApiData = result; // 기존 전역 변수 유지
        return result;

      } catch (error) {
        console.error("상품 정보 가져오기 실패:", error);
        return null;
      } finally {
        // 요청 완료 후 pending 목록에서 제거
        pendingRequests.delete(productCd);
      }
    })();

    // 진행 중인 요청으로 등록
    pendingRequests.set(productCd, requestPromise);

    return requestPromise;
  };
})();

// 재주문 정보 가져오기 함수 - 토큰 체크 없이 항상 API 호출
export const handleReOrder = async () => {
  try {
    const response = await fetch("/trip-api/auth/reOrder", {
      method: "GET",
      redirect: "follow",
    });
    const result = await response.json();

    if (result.success) {
      window.reOrderData = result;
      return result;
    }

    return null;
  } catch (error) {
    console.error("재주문 정보 가져오기 실패:", error);
    return null;
  }
};

// ReOrder 컨텍스트 제공자 컴포넌트
export const ReOrderProvider = ({ children }) => {
  const [reOrderData, setReOrderData] = useState(null);

  // 컴포넌트 마운트 시 데이터 로드
  React.useEffect(() => {
    const loadReOrderData = async () => {
      const data = await handleReOrder();
      if (data) {
        setReOrderData(data);
      }
    };

    loadReOrderData();
  }, []);

  return (
    <ReOrderContext.Provider value={reOrderData}>
      {children}
    </ReOrderContext.Provider>
  );
};

export const useReOrderData = () => {
  const context = useContext(ReOrderContext);
  return context;
};

// 데이터 정리 함수
const clearAllData = () => {
  // Redux 상태 초기화 - 모든 슬라이스의 reset 액션 실행
  const slicesToReset = [
    "purpose",
    "hasDeparted",
    "plan",
    "calendar",
    "user",
    "companions",
    "country",
    "totalPrice",
    "priceData",
    "insurance",
    "personalInfo",
    "userForm",
    "companionForm",
    "pdf",
  ];

  slicesToReset.forEach((sliceName) => {
    store.dispatch({ type: `${sliceName}/reset` });
  });

  try {
    // Redux 상태 정리
    sessionStorage.removeItem("reduxState");
    sessionStorage.removeItem("calcExcel_userData");
    sessionStorage.removeItem("calcExcel_fileName");
    sessionStorage.removeItem("isDomesticExcelMode");
    sessionStorage.removeItem("isExcelMode");
    sessionStorage.removeItem("indemnityState");
  } catch (error) {
    console.warn("세션스토리지 정리 중 오류 발생:", error);
  }
};

// ProductInfo 캐시 관리 유틸리티 함수들
window.clearProductCache = (productCd) => {
  try {
    if (productCd) {
      // 특정 상품 캐시 삭제
      sessionStorage.removeItem(`productInfo_${productCd}`);
    } else {
      // 모든 상품 캐시 삭제
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('productInfo_')) {
          sessionStorage.removeItem(key);
        }
      });
    }
  } catch (error) {
    console.warn("캐시 삭제 실패:", error);
  }
};

// 현재 캐시된 상품 목록 확인
window.getCachedProducts = () => {
  try {
    const cachedProducts = [];
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('productInfo_')) {
        const productCd = key.replace('productInfo_', '');
        cachedProducts.push(productCd);
      }
    });
    return cachedProducts;
  } catch (error) {
    console.warn("캐시 목록 조회 실패:", error);
    return [];
  }
};

export function createAppEntry({
  Router,
  getBasename,
  usePartnerContext = false,
  useAppComponent = false,
  useBrowserSelector = true,
  disasterApp,
  productCd,
  useReOrderContext = false,
  appName, // 새로 추가된 매개변수
}) {
  // AppType이 변경될 때 데이터 정리 및 새로운 AppType 설정
  if (appName) {
    const currentAppType = store.getState().appState.currentAppType;
    const newAppType = appName.toUpperCase();

    // claim과 home은 데이터 정리 제외 대상
    const excludeFromClearData = ["CLAIM", "HOME"];

    // 이전 appType과 다른 경우에만 데이터 정리 (단, claim/home 제외)
    if (
      currentAppType &&
      currentAppType !== newAppType &&
      !excludeFromClearData.includes(newAppType) &&
      !excludeFromClearData.includes(currentAppType)
    ) {
      clearAllData();
      console.log("이전 데이터 정리 완료:", currentAppType, "->", newAppType);
    } else if (
      excludeFromClearData.includes(newAppType) ||
      excludeFromClearData.includes(currentAppType)
    ) {
      console.log("데이터 정리 제외 대상:", currentAppType, "->", newAppType);
    }

    store.dispatch(setAppType(newAppType));
  }

  if (productCd) {
    const cleanProductCd = productCd.trim().replace(/;$/, ""); // 상품 코드에서 공백과 세미콜론 제거
    window.productCd = cleanProductCd; // 전역 변수에 저장

    // 캐시된 fetchProductInfo 함수 호출
    window.fetchProductInfo(cleanProductCd);
  }

  // 앱 시작시 항상 handleReOrder 호출
  setTimeout(() => {
    handleReOrder();
  }, 0);

  if (useAppComponent) {
    if (getBasename) {
      const basename = getBasename();
      window.basename = basename;
    }

    const root = ReactDOM.createRoot(document.getElementById("root"));

    // 재난 앱 특수 처리
    let AppRouter = Router;
    if (disasterApp) {
      if (disasterApp === "safeguard") {
        AppRouter = require("./apps/safety/disasterSafeguard/Router").default;
      } else if (disasterApp === "house") {
        AppRouter = require("./apps/safety/disasterHouse/Router").default;
      } else if (disasterApp === "governance") {
        AppRouter = require("./apps/safety/disasterGovernance/Router").default;
      } else {
        AppRouter = require("./apps/safety/disasterSafeguard/Router").default;
      }
    }

    let appContent = (
      <Provider store={store}>
        <App Router={AppRouter} />
      </Provider>
    );

    // ReOrder 컨텍스트 조건부 적용
    if (useReOrderContext) {
      appContent = <ReOrderProvider>{appContent}</ReOrderProvider>;
    }

    // 파트너 컨텍스트 적용 여부에 따라 렌더링
    if (usePartnerContext) {
      root.render(<PartnerProvider>{appContent}</PartnerProvider>);
    } else {
      root.render(appContent);
    }

    reportWebVitals();
    return;
  }

  const AppContainer = () => {
    const basename = getBasename ? getBasename() : process.env.PUBLIC_URL || ""; // basename 계산
    window.basename = basename; // 글로벌 변수로 설정 (레거시 코드 지원)

    let appContent = (
      <Provider store={store}>
        <div className="layoutWrapper">
          {useBrowserSelector && <BrowserSelector />}
          <BrowserRouter basename={basename}>
            <Router />
          </BrowserRouter>
        </div>
      </Provider>
    );

    // ReOrder 컨텍스트 조건부 적용
    if (useReOrderContext) {
      appContent = <ReOrderProvider>{appContent}</ReOrderProvider>;
    }

    // 파트너 컨텍스트 적용 여부에 따라 다른 렌더링
    if (usePartnerContext) {
      return <PartnerProvider>{appContent}</PartnerProvider>;
    }

    return appContent;
  };

  // DOM에 렌더링
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<AppContainer />);
  reportWebVitals();
}