import { useEffect } from "react";

const BrowserSelector = () => {
    const copyToClipboard = (val) => {
        const t = document.createElement("textarea");
        document.body.appendChild(t);
        t.value = val;
        t.select();
        document.execCommand("copy");
        document.body.removeChild(t);
    };

    const inAppBrowserOut = () => {
        copyToClipboard(window.location.href);
        alert(
            'URL주소가 복사되었습니다.\n\nSafari가 열리면 주소창을 길게 터치한 뒤, "붙여놓기 및 이동"를 누르면 정상적으로 이용하실 수 있습니다.'
        );
        window.location.href = "x-web-search://?";
    };

    useEffect(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        const targetUrl = window.location.href;

        if (userAgent.match(/kakaotalk/i)) {
            // 카카오톡 외부 브라우저로 호출
            window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(
                targetUrl
            )}`;
        } else if (userAgent.match(/line/i)) {
            // 라인 외부 브라우저로 호출
            window.location.href = targetUrl.includes("?")
                ? `${targetUrl}&openExternalBrowser=1`
                : `${targetUrl}?openExternalBrowser=1`;
        } else if (
            userAgent.match(
                /inapp|naver|snapchat|wirtschaftswoche|thunderbird|instagram|everytimeapp|whatsapp|electron|wadiz|aliapp|zumapp|iphone(.*)whale|android(.*)whale|kakaostory|band|twitter|daumaaps|daumdevice\/mobile|fb_iab|fb4a|fban|fbios|fbss|samsungbrowser\/[^1]/i
            )
        ) {
            // 그 외 다른 인앱 브라우저들
            if (!userAgent.match(/iphone|ipad|ipod/i)) {
                // 안드로이드는 Chrome이 설치되어 있으므로 강제로 스킴 실행
                window.location.href = `intent://${targetUrl.replace(
                    /https?:\/\//i,
                    ""
                )}#Intent;scheme=http;package=com.android.chrome;end`;
            } else {
                // iOS 디바이스의 경우 inAppBrowserOut 함수 실행
                inAppBrowserOut();
            }
        }
    }, []);

    return null; // 이 컴포넌트는 UI를 렌더링하지 않습니다.
};

export default BrowserSelector;
