import { AmazonPayV2ButtonColor } from '@bigcommerce/checkout-sdk/amazon-pay-utils';

export default interface AmazonPayWalletInitializeOptions {
    /**
     * The cart entity id the headless button pays for. Supplied by the host page
     * (PDP/cart) so the strategy never has to load a full checkout session.
     */
    cartId: string;

    /**
     * The currency the cart is priced in.
     */
    currency: {
        code: string;
    };

    /**
     * A Base64-encoded, JSON-serialized `PaymentMethod<AmazonPayV2InitializeOptions>`
     * (merchantId, ledgerCurrency, region, publicKeyId, testMode ...). Mirrors the
     * PayPal/Braintree wallet strategies, which also receive their payment method
     * as an opaque Base64 blob instead of reading it from checkout state.
     *
     * For Amazon Pay the `initializationData.createCheckoutSessionConfig`
     * (`payloadJSON`/`signature`/`publicKeyId`) is the server-signed payload sourced
     * upstream from `paymentWalletWithInitializationData` and handed to `initCheckout()`.
     */
    initializationData: string;

    /**
     * Optional estimated order amount used by Amazon Pay for risk assessment.
     * Falls back to omitting `estimatedOrderAmount` when not provided.
     */
    estimatedAmount?: string;

    /**
     * Optional Amazon Pay button color. Defaults to `Gold`.
     */
    buttonColor?: AmazonPayV2ButtonColor;
}

export interface WithAmazonPayWalletInitializeOptions {
    // Key matches the wallet resolve id (dot-stripped entity id `amazonpay.amazonpay`),
    // following the PayPal/Braintree/BigCommerce Payments convention.
    amazonpayamazonpay?: AmazonPayWalletInitializeOptions;
}
