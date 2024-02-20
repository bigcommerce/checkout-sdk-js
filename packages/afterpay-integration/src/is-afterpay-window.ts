import AfterpayWindow from './afterpay-window';

export default function isAfterpayWindow(window: Window): window is AfterpayWindow {
    return 'AfterPay' in window;
}
