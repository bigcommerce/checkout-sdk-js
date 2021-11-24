export default class ApplePaySessionFactory {
    create(request: ApplePayJS.ApplePayPaymentRequest): ApplePaySession {
        return new ApplePaySession(1, request);
    }
}
