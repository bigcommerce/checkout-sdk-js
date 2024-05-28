import { PayPalFastlaneSdk } from '../paypal-commerce-types';

import getPayPalFastlane from './get-paypal-fastlane.mock';

export default function getPayPalFastlaneSdk(): PayPalFastlaneSdk {
    return {
        Fastlane: () => Promise.resolve(getPayPalFastlane()),
    };
}
