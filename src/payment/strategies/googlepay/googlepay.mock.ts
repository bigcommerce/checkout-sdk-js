import { GooglePaySDK } from './googlepay';

export function getGooglePaySDKMock(): GooglePaySDK {
    return {
        payments: jest.fn(),
    };
}
