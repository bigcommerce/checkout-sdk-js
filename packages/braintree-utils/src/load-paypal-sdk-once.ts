import { BraintreePaypalCheckout, BraintreePaypalSdkCreatorConfig } from './braintree';
import { BraintreeError } from './types';

let paypalSdkPromise: Promise<BraintreePaypalCheckout | null> | null = null;

export default function loadPayPalSDKOnce(
    paypalCheckout: BraintreePaypalCheckout,
    config: BraintreePaypalSdkCreatorConfig,
): Promise<BraintreePaypalCheckout | null> {
    if (!paypalSdkPromise) {
        paypalSdkPromise = new Promise((resolve, reject) => {
            paypalCheckout.loadPayPalSDK(config, (err: null | undefined | BraintreeError) => {
                if (err) {
                    paypalSdkPromise = null;

                    reject(err);
                } else {
                    resolve(paypalCheckout);
                }
            });
        });
    }

    return paypalSdkPromise;
}

// for testing purposes
export function resetLoadPayPalSDKOncePromise() {
    paypalSdkPromise = null;
}
