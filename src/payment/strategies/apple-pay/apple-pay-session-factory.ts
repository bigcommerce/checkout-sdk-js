import { assertApplePayWindow } from "./is-apple-pay-window";

export default class ApplePaySessionFactory {
    create(request: ApplePayJS.ApplePayPaymentRequest): ApplePaySession {
        assertApplePayWindow(window);

        return new ApplePaySession(1, request);
    }
}
