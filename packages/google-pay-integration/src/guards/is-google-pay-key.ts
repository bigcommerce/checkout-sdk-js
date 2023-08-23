import { GooglePayKey } from '../google-pay-payment-initialize-options';

export default function isGooglePayKey(key: string): key is GooglePayKey {
    return Object.values<string>(GooglePayKey).includes(key);
}
