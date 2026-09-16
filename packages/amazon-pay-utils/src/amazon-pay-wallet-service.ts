import {
    PaymentMethod,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    AmazonPayV2ButtonColor,
    AmazonPayV2CheckoutSessionConfig,
    AmazonPayV2InitializeOptions,
    AmazonPayV2SDK,
} from './amazon-pay-v2';
import AmazonPayV2ScriptLoader from './amazon-pay-v2-script-loader';

/**
 * Headless "wallet button" service for Amazon Pay.
 *
 * NOTE — divergence from the PayPal/Braintree/BigCommerce Payments wallet services:
 * those are built on top of `WalletButtonIntegrationService`. Amazon Pay's headless
 * button legs (render + click) use **none** of that service's GraphQL primitives:
 *
 * - `createPaymentWalletIntent` is PayPal-family-specific by design — Amazon Pay is
 *   `requires_initialization_record? = false` (same as Braintree) and never calls a
 *   BC "create order" mutation. The union `PaymentWalletIntentData` has no Amazon member.
 * - Address (`addBillingAddress`) and redirect (`getRedirectToCheckoutUrl`) are handled
 *   entirely server-side after Amazon's own redirect (BE tickets 3–5).
 *
 * The signed "Create Checkout Session" config is fetched upstream via
 * `site.paymentWalletWithInitializationData(paymentWalletEntityId: "amazonpay.amazonpay")`
 * and delivered to the strategy inside `initializationData`. Amazon's own JS SDK then
 * opens the checkout session directly from `payloadJSON`/`signature`.
 *
 * So this service is intentionally thin: SDK loading, config extraction, button styling.
 */
export default class AmazonPayWalletService {
    private amazonPaySdk?: AmazonPayV2SDK;

    constructor(private scriptLoader: AmazonPayV2ScriptLoader) {}

    /**
     *
     * Amazon Pay SDK methods
     *
     */
    async loadAmazonPaySdk(
        paymentMethod: PaymentMethod<AmazonPayV2InitializeOptions>,
    ): Promise<AmazonPayV2SDK> {
        this.amazonPaySdk = await this.scriptLoader.load(paymentMethod);

        return this.amazonPaySdk;
    }

    getAmazonPaySdkOrThrow(): AmazonPayV2SDK {
        if (!this.amazonPaySdk) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.amazonPaySdk;
    }

    /**
     *
     * Checkout session config
     *
     * The server-signed config is delivered inside `initializationData` (sourced upstream
     * from `paymentWalletWithInitializationData`). Passed straight to `button.initCheckout()`.
     */
    getCheckoutSessionConfigOrThrow(
        paymentMethod: PaymentMethod<AmazonPayV2InitializeOptions>,
    ): AmazonPayV2CheckoutSessionConfig {
        const config = paymentMethod.initializationData?.createCheckoutSessionConfig;

        if (!config?.payloadJSON || !config.signature) {
            throw new Error('Missing Amazon Pay "createCheckoutSessionConfig".');
        }

        return config;
    }

    /**
     *
     * Button style methods
     *
     */
    getValidButtonColor(color?: AmazonPayV2ButtonColor): AmazonPayV2ButtonColor {
        return color && AmazonPayV2ButtonColor[color] ? color : AmazonPayV2ButtonColor.Gold;
    }

    /**
     *
     * Utils methods
     *
     */
    removeElement(elementId?: string): void {
        const element = elementId && document.getElementById(elementId);

        if (element) {
            element.style.display = 'none';
        }
    }
}
