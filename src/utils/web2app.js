// utils/web2app.js

const TIMEOUT_IOS = 2.4 * 1000;
const TIMEOUT_ANDROID = 3 * 100;
const INTERVAL = 100;

// 브라우저와 OS 체크
const userAgent = () => {
  const ua = navigator.userAgent.toLowerCase();
  const browser = {
    chrome: /chrome|crios/.test(ua),
    version: {
      major: parseInt(ua.match(/chrome\/(\d+)/)?.[1] || "0", 10),
    },
  };

  return {
    ua,
    browser,
    os: {
      android: /android/.test(ua),
      ios: /iphone|ipad|ipod/.test(ua),
      version: {
        major: parseInt(ua.match(/os (\d+)_?/)?.[1] || "0", 10),
      },
    },
  };
};

function moveToStore(storeURL) {
  window.location.href = storeURL;
}

function isPageVisible() {
  const attrNames = ["hidden", "webkitHidden"];
  for (let i = 0; i < attrNames.length; i++) {
    if (typeof document[attrNames[i]] !== "undefined") {
      const isVisible = !document[attrNames[i]];
      // alert(`페이지 visible 체크: ${isVisible}`);
      return isVisible;
    }
  }
  return true;
}
function createHiddenIframe(id) {
  const iframe = document.createElement("iframe");
  iframe.id = id;
  iframe.style.border = "none";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.display = "none";
  iframe.style.overflow = "hidden";
  document.body.appendChild(iframe);
  return iframe;
}

function launchAppViaHiddenIframe(urlScheme) {
  setTimeout(() => {
    const iframe = createHiddenIframe("appLauncher");
    iframe.src = urlScheme;
  }, 100);
}

function deferFallback(timeout, storeURL, fallback) {
  const clickedAt = new Date().getTime();
  return setTimeout(() => {
    const now = new Date().getTime();
    // alert(`시간 체크: ${now - clickedAt}ms 경과`);
    if (isPageVisible() && now - clickedAt < timeout + INTERVAL) {
      const storeName = userAgent().os.ios ? "App Store" : "Play Store";
      // 사용자 경험 개선: 스토어로 이동하기 전에 사용자 확인
      if (window.confirm(`'${storeName}'에서 이 페이지를 열겠습니까?`)) {
        fallback(storeURL);
      }
    }
  }, timeout);
}

export function web2app(context) {
  const ua = userAgent();
  const willInvokeApp =
    typeof context.willInvokeApp === "function"
      ? context.willInvokeApp
      : () => {};
  const onAppMissing =
    typeof context.onAppMissing === "function"
      ? context.onAppMissing
      : moveToStore;
  const onUnsupportedEnvironment =
    typeof context.onUnsupportedEnvironment === "function"
      ? context.onUnsupportedEnvironment
      : () => {};

  willInvokeApp();

  if (ua.os.android) {
    const intentSupportedBrowser =
      ua.browser.chrome && ua.browser.version.major >= 25;

    if (intentSupportedBrowser && context.intentURI && !context.useUrlScheme) {
      // Intent URI 방식
      if (ua.browser.chrome) {
        window.location.href = context.intentURI;
      } else {
        setTimeout(() => {
          window.location.href = context.intentURI;
        }, 100);
      }
    } else if (context.storeURL) {
      // URL Scheme 방식
      const tid = deferFallback(
        TIMEOUT_ANDROID,
        context.storeURL,
        onAppMissing
      );
      launchAppViaHiddenIframe(context.urlScheme);
    }
  } else if (ua.os.ios && context.storeURL) {
    const tid = deferFallback(TIMEOUT_IOS, context.storeURL, onAppMissing);

    // iOS 버전에 따른 이벤트 바인딩
    if (ua.os.version.major < 8) {
      // alert('iOS 8 미만');
      window.addEventListener("pagehide", function clear() {
        // alert('pagehide 이벤트 발생');
        if (isPageVisible()) {
          // alert('페이지 visible - clearTimeout 실행');
          clearTimeout(tid);
          window.removeEventListener("pagehide", clear);
        }
      });
    } else {
      // alert('iOS 8 이상');
      document.addEventListener("visibilitychange", function clear() {
        // alert('visibilitychange 이벤트 발생');
        if (isPageVisible()) {
          // alert('페이지 visible - clearTimeout 실행');
          clearTimeout(tid);
          document.removeEventListener("visibilitychange", clear);
        }
      });
    }

    // Universal Links 지원 확인
    if (ua.os.version.major > 8) {
      // alert('Universal Links 지원');
      if (context.universalLink === undefined) {
        // alert('universalLink 미설정 - urlScheme로 대체');
        context.universalLink = context.urlScheme;
      }
      window.location.href = context.universalLink;
    } else {
      // alert('Universal Links 미지원 - iframe으로 실행');
      launchAppViaHiddenIframe(context.urlScheme);
    }
  } else {
    setTimeout(() => {
      onUnsupportedEnvironment();
    }, 100);
  }
}
