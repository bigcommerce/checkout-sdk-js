import { VerifyPayload } from './braintree';

export interface BraintreePaymentInitializeOptions {
    threeDSecure?: BraintreeThreeDSecureOptions;
}

export interface BraintreeThreeDSecureOptions {
    addFrame(error: Error | undefined, iframe: HTMLIFrameElement, cancel: () => Promise<VerifyPayload> | undefined): void;
    removeFrame(): void;
}
