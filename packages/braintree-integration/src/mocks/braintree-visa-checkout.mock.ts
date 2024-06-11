import { VisaCheckoutSDK } from '@bigcommerce/checkout-sdk/braintree-utils';

export function getVisaCheckoutSDKMock(): VisaCheckoutSDK {
    return {
        init: jest.fn(),
        on: jest.fn(),
    };
}
