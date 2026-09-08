import { PayPalSdkNamespace } from '../paypal-constants';
import { PayPalHostWindow } from '../paypal-types';

export default function getPayPalSdkModule<K extends PayPalSdkNamespace>(
    namespace: K,
): PayPalHostWindow[K] {
    return (window as PayPalHostWindow)[namespace];
}
