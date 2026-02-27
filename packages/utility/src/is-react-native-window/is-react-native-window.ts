interface ReactNativeWindow extends Window {
    ReactNativeWebView: {
        postMessage(msg: string): void;
    };
}

export function isReactNativeWindow(window: Window): window is ReactNativeWindow {
    return 'ReactNativeWebView' in window;
}
