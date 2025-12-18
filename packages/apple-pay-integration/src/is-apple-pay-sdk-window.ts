interface ApplePaySdkWindow extends Window {
    ApplePaySDK?: {
        origin: string;
        publicPath: string;
        token: string | undefined;
    };
}

export default function isApplePaySdkWindow(window: Window): window is ApplePaySdkWindow {
    return 'ApplePaySDK' in window;
}
