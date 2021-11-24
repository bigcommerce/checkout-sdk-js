
export class MockApplePaySession {
    static supportsVersion: () => boolean;
    static canMakePayments: () => boolean;

    completePayment = jest.fn();

    completeMerchantValidation() {
        return true;
    }

    onvalidatemerchant() { }

    onpaymentauthorized(event?: ApplePayJS.ApplePayPaymentAuthorizedEvent) {
        return event;
    }

    oncancel() { }

    begin() {
        return true;
    }
}
