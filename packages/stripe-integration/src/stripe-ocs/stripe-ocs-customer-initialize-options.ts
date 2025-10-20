import {BuyNowCartRequestBody} from '@bigcommerce/checkout-sdk/payment-integration-api';

export default interface StripeLinkV2InitializeOptions {
    buttonHeight?: number;

    /**
     * The ID of a container which the stripe iframe should be inserted.
     */
    container: string;

    /**
     * The identifier of the payment method.
     */
    methodId: string;

    gatewayId: string;

    onComplete?: (orderId?: number) => Promise<never>;

    loadingContainerId?: string;

    buyNowInitializeOptions?: StripeLinkV2BuyNowInitializeOptions;
    currencyCode?: string;
}

export interface StripeLinkV2BuyNowInitializeOptions {
    storefrontApiToken?: string;
    getBuyNowCartRequestBody(): BuyNowCartRequestBody;
}

export interface WithStripeOCSCustomerInitializeOptions {
    stripeocs?: StripeLinkV2InitializeOptions;
}
