export class MockApplePaySession {
    static supportsVersion: () => boolean;
    static canMakePayments: () => boolean;

    completePayment = jest.fn();

    begin = jest.fn();
    oncancel = jest.fn();
    onpaymentmethodselected = jest.fn();

    completeShippingContactSelection = jest.fn();

    completeShippingMethodSelection = jest.fn();

    abort = jest.fn();

    completeMerchantValidation() {
        return true;
    }

    onvalidatemerchant(event: ApplePayJS.ApplePayValidateMerchantEvent) {
        return event;
    }
    onpaymentauthorized(event?: ApplePayJS.ApplePayPaymentAuthorizedEvent) {
        return event;
    }

    onshippingcontactselected(event?: ApplePayJS.ApplePayShippingContactSelectedEvent) {
        return event;
    }

    onshippingmethodselected(event?: ApplePayJS.ApplePayShippingMethodSelectedEvent) {
        return event;
    }
}
