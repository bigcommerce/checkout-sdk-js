import {
    AmazonPayV2ButtonColor,
    AmazonPayV2CheckoutSessionConfig,
    AmazonPayV2InitializeOptions,
    AmazonPayV2NewButtonParams,
    AmazonPayV2PaymentProcessor,
    AmazonPayV2PayOptions,
    AmazonPayV2Placement,
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

export default class AmazonPayWalletStrategy implements CheckoutButtonStrategy {
    constructor(private amazonPayV2PaymentProcessor: AmazonPayV2PaymentProcessor) {}

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

        await this.amazonPayV2PaymentProcessor.initialize(paymentMethod);

        this.renderButton(containerId, amazonpayamazonpay, paymentMethod);
    }

    deinitialize(): Promise<void> {
        return this.amazonPayV2PaymentProcessor.deinitialize();
    }

    private renderButton(
        containerId: string,
        amazonpay: AmazonPayWalletInitializeOptions,
        paymentMethod: PaymentMethod<AmazonPayV2InitializeOptions>,
    ): void {
        const { config, initializationData } = paymentMethod;
        const merchantId = config?.merchantId;
        const ledgerCurrency = initializationData?.ledgerCurrency;

        if (!merchantId || !ledgerCurrency) {
            this.removeElement(containerId);

            return;
        }

        const publicKeyId = initializationData?.publicKeyId ?? '';
        const isEnvironmentSpecific = /^(SANDBOX|LIVE)/.test(publicKeyId);

        const buttonParams: AmazonPayV2NewButtonParams = {
            merchantId,
            ledgerCurrency,
            checkoutLanguage: initializationData?.checkoutLanguage,
            productType: AmazonPayV2PayOptions.PayAndShip,
            placement: AmazonPayV2Placement.Cart,
            buttonColor: amazonpay.buttonColor ?? AmazonPayV2ButtonColor.Gold,
            // Amazon Pay ignores `sandbox` when `publicKeyId` carries an env prefix.
            ...(isEnvironmentSpecific ? { publicKeyId } : { sandbox: Boolean(config?.testMode) }),
            ...(amazonpay.estimatedAmount && {
                estimatedOrderAmount: {
                    amount: amazonpay.estimatedAmount,
                    currencyCode: amazonpay.currency.code || ledgerCurrency,
                },
            }),
        };

        this.amazonPayV2PaymentProcessor.createButton(containerId, buttonParams);

        // TODO(PAYPAL-7057): `initializationData.createCheckoutSessionConfig` is undefined
        const signedConfig = this.getRequiredCheckoutSessionConfig(initializationData);

        if (signedConfig) {
            this.amazonPayV2PaymentProcessor.prepareCheckout(signedConfig);
        }
    }

    private getRequiredCheckoutSessionConfig(
        initializationData?: AmazonPayV2InitializeOptions,
    ): Required<AmazonPayV2CheckoutSessionConfig> | undefined {
        const config = initializationData?.createCheckoutSessionConfig;

        if (!config?.payloadJSON || !config.signature || !config.publicKeyId) {
            return undefined;
        }

        return {
            payloadJSON: config.payloadJSON,
            signature: config.signature,
            publicKeyId: config.publicKeyId,
        };
    }

    private removeElement(elementId: string): void {
        const element = document.getElementById(elementId);

        if (element) {
            element.style.display = 'none';
        }
    }
}
