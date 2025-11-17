import ApplePayWindow from './apple-pay-window';
import isApplePayWindow from './is-apple-pay-window';

export function assertApplePayWindow(window: Window): asserts window is ApplePayWindow {
    if (!isApplePayWindow(window)) {
        throw new Error('Apple pay is not supported');
    }
}

export default class ApplePaySessionFactory {
    create(request: ApplePayJS.ApplePayPaymentRequest): ApplePaySession {
        assertApplePayWindow(window);

        return new ApplePaySession(1, request);
    }
}
