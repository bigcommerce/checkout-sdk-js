import { PayPalAxoSdk } from '../paypal-commerce-types';

import getPayPalConnect from './get-paypal-connect.mock';

export default function getPayPalAxoSdk(): PayPalAxoSdk {
    return {
        Connect: () => Promise.resolve(getPayPalConnect()),
    };
}
