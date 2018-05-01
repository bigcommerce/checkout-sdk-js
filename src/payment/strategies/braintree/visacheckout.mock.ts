import { VisaCheckoutSDK } from './visacheckout';

export function getVisaCheckoutSDKMock(): VisaCheckoutSDK {
    return {
        init: jest.fn(),
        on: jest.fn(),
    };
}
