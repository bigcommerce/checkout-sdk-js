import { PayPalFastlaneSdk } from '../paypal-types';

import getPayPalFastlane from './get-paypal-fastlane.mock';

export default function getPayPalFastlaneSdk(): PayPalFastlaneSdk {
    return {
        ThreeDomainSecureClient: {
            isEligible: jest.fn(),
            show: jest.fn(),
        },
        Fastlane: () => Promise.resolve(getPayPalFastlane()),
    };
}
