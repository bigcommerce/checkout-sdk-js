import { isOperaWindow } from '../is-opera-window';
import { isReactNativeWindow } from '../is-react-native-window';

export function isWebView(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    if (isReactNativeWindow(window)) {
        return true;
    }

    const userAgent =
        navigator.userAgent || navigator.vendor || (isOperaWindow(window) ? window.opera : '');

    const isAndroidWebView = /android.+; wv/i.test(userAgent);
    const isIOSWebView =
        /iPhone|iPod|iPad/i.test(userAgent) &&
        /AppleWebKit/i.test(userAgent) &&
        !/Safari/i.test(userAgent);

    return isAndroidWebView || isIOSWebView;
}
