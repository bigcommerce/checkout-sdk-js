import { BraintreeVerifyPayload } from './braintree';

export interface BraintreePaymentInitializeOptions {
    threeDSecure?: BraintreeThreeDSecureOptions;
}

export interface BraintreeThreeDSecureOptions {
    addFrame(error: Error | undefined, iframe: HTMLIFrameElement, cancel: () => Promise<BraintreeVerifyPayload> | undefined): void;
    removeFrame(): void;
}
