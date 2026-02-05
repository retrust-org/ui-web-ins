import { useEffect, useCallback, useState } from 'react';
import TagManager from 'react-gtm-module';

const useAnalytics = () => {
    // 첫 방문 시 기초 정보 저장
    useEffect(() => {
        const saveInitialData = async () => {
            const initialData = {
                userAgent: navigator.userAgent,
                language: navigator.language,
                screenResolution: `${window.screen.width}x${window.screen.height}`,
                timestamp: new Date().toISOString(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                referrer: document.referrer,
                pageUrl: window.location.href,
            };

            try {
                const response = await fetch('/trip-api/analytics/initial', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(initialData),
                });

                if (!response.ok) {
                    throw new Error('Failed to save initial data');
                }
            } catch (error) {
                console.error('Error saving initial data:', error);
            }
        };

        saveInitialData();
    }, []);

    // 페이지 뷰 로깅
    const logPageView = useCallback((path) => {
        TagManager.dataLayer({
            dataLayer: {
                event: 'pageview',
                page: path,
            },
        });

        fetch('/trip-api/analytics/pageview', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                path,
                timestamp: new Date().toISOString(),
                pageUrl: window.location.href,
                referrer: document.referrer,
            }),
        }).catch(error => console.error('Error logging page view:', error));
    }, []);

    // 이벤트 로깅
    const logEvent = useCallback((eventName, eventParams) => {
        TagManager.dataLayer({
            dataLayer: {
                event: eventName,
                ...eventParams,
            },
        });

        fetch('/trip-api/analytics/event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                eventName,
                eventParams,
                timestamp: new Date().toISOString(),
                pageUrl: window.location.href,
            }),
        }).catch(error => console.error('Error logging event:', error));
    }, []);

    return { logPageView, logEvent };
};

export default useAnalytics;