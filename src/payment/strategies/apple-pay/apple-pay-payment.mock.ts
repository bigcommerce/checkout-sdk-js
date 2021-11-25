
export class MockApplePaySession {
    static supportsVersion: () => boolean;
    static canMakePayments: () => boolean;

    completePayment = jest.fn();

    begin = jest.fn();

    completeMerchantValidation() {
        return true;
    }

    onvalidatemerchant() { }

    onpaymentauthorized(event?: ApplePayJS.ApplePayPaymentAuthorizedEvent) {
        return event;
    }

    oncancel() { }
}