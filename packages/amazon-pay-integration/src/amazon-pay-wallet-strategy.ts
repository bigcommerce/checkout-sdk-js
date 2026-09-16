import {
    AmazonPayV2InitializeOptions,
    AmazonPayV2LedgerCurrency,
    AmazonPayV2NewButtonParams,
    AmazonPayV2PayOptions,
    AmazonPayV2Placement,
    AmazonPayV2Price,
    AmazonPayWalletService,
} from '@bigcommerce/checkout-sdk/amazon-pay-utils';
import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import AmazonPayWalletInitializeOptions, {
    WithAmazonPayWalletInitializeOptions,
} from './amazon-pay-wallet-initialize-options';

/**
 * Headless "wallet button" strategy for Amazon Pay.
 *
 * Wallet entity id: `amazonpay.amazonpay` (provider "Amazon Pay").
 *
 * Renders the Amazon Pay button on a PDP/cart page and completes a purchase without
 * `PaymentIntegrationService`, `loadDefaultCheckout`, or `getCartOrThrow`. It depends
 * only on {@link AmazonPayWalletService} and the incoming `cartId` + Base64 payment
 * method (whose `initializationData` carries the server-signed checkout session config,
 * sourced upstream from `paymentWalletWithInitializationData`).
 *
 * Unlike the PayPal/Braintree wallet strategies there is no `createOrder`/`onApprove`
 * callback pair and no call into `WalletButtonIntegrationService`: Amazon Pay owns the
 * approval + redirect. The strategy binds `button.onClick` and hands the signed config
 * to `button.initCheckout()`, which redirects the shopper to Amazon and back to the
 * checkout return url baked into the signed payload. Address capture + order completion
 * happen entirely server-side after that redirect.
 */
export default class AmazonPayWalletStrategy implements CheckoutButtonStrategy {
    constructor(private amazonPayWalletService: AmazonPayWalletService) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithAmazonPayWalletInitializeOptions,
    ): Promise<void> {
        const { amazonpayamazonpay, containerId, methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!containerId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.containerId" argument is not provided.',
            );
        }

        if (!amazonpayamazonpay) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.amazonpayamazonpay" argument is not provided.',
            );
        }

        let paymentMethod: PaymentMethod<AmazonPayV2InitializeOptions>;

        try {
            paymentMethod = JSON.parse(atob(amazonpayamazonpay.initializationData));
        } catch {
            throw new InvalidArgumentError("Failed to parse payment method 'initializationData'.");
        }

        await this.amazonPayWalletService.loadAmazonPaySdk(paymentMethod);

        this.renderButton(containerId, amazonpayamazonpay, paymentMethod);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private renderButton(
        containerId: string,
        amazonpay: AmazonPayWalletInitializeOptions,
        paymentMethod: PaymentMethod<AmazonPayV2InitializeOptions>,
    ): void {
        const amazonPaySdk = this.amazonPayWalletService.getAmazonPaySdkOrThrow();
        const { config, initializationData } = paymentMethod;

        const merchantId = config?.merchantId;
        const ledgerCurrency = initializationData?.ledgerCurrency;

        if (!merchantId || !ledgerCurrency) {
            this.amazonPayWalletService.removeElement(containerId);

            return;
        }

        const buttonParams: AmazonPayV2NewButtonParams = {
            merchantId,
            ledgerCurrency,
            checkoutLanguage: initializationData?.checkoutLanguage,
            productType: AmazonPayV2PayOptions.PayAndShip,
            placement: AmazonPayV2Placement.Cart,
            buttonColor: this.amazonPayWalletService.getValidButtonColor(amazonpay.buttonColor),
            publicKeyId: initializationData?.publicKeyId,
            sandbox: Boolean(config?.testMode),
        };

        const createCheckoutSessionConfig =
            this.amazonPayWalletService.getCheckoutSessionConfigOrThrow(paymentMethod);

        const amazonPayButton = amazonPaySdk.Pay.renderButton(`#${containerId}`, buttonParams);

        // Amazon Pay "decoupled" checkout initiation: on click, hand the server-signed
        // config to initCheckout(), which owns the redirect to Amazon Pay.
        amazonPayButton.onClick(() => {
            amazonPayButton.initCheckout({
                createCheckoutSessionConfig,
                productType: AmazonPayV2PayOptions.PayAndShip,
                ...this.getEstimatedOrderAmount(amazonpay, ledgerCurrency),
            });
        });
    }

    private getEstimatedOrderAmount(
        amazonpay: AmazonPayWalletInitializeOptions,
        ledgerCurrency: AmazonPayV2LedgerCurrency,
    ): { estimatedOrderAmount?: AmazonPayV2Price } {
        if (!amazonpay.estimatedAmount) {
            return {};
        }

        return {
            estimatedOrderAmount: {
                amount: amazonpay.estimatedAmount,
                currencyCode: amazonpay.currency.code || ledgerCurrency,
            },
        };
    }
}
