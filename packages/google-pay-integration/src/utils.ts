declare global {
    interface Window {
        ReactNativeWebView?: {
            postMessage(msg: string): void;
        };
        opera?: string;
    }
}

export function isWebView() {
    if (window.ReactNativeWebView) {
        return true;
    }

    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    let isAndroidWebView = false;
    let isIOSWebView = false;

    if (typeof userAgent === 'string') {
        isAndroidWebView = /android.+; wv/i.test(userAgent);
        isIOSWebView = /iPhone|iPod|iPad/i.test(userAgent) && !/Safari/i.test(userAgent);
    }

    return isAndroidWebView || isIOSWebView;
}
