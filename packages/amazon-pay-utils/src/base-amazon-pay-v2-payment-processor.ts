import {
    guard,
    NotInitializedError,
    NotInitializedErrorType,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    AmazonPayV2Button,
    AmazonPayV2ButtonParameters,
    AmazonPayV2CheckoutSessionConfig,
    AmazonPayV2InitializeOptions,
    AmazonPayV2PayOptions,
    AmazonPayV2Price,
    AmazonPayV2SDK,
    RequestConfig,
} from './amazon-pay-v2';
import AmazonPayV2ScriptLoader from './amazon-pay-v2-script-loader';

/**
 * Minimal surface shared by every Amazon Pay v2 flow: loading the SDK,
 * rendering a button and kicking off the checkout session. Flows that need
 * more (e.g. rebinding the edit button, buy now, PH4 button options) should
 * use a subclass that extends this with the rest of the surface.
 */
export default class BaseAmazonPayV2PaymentProcessor {
    protected amazonPayV2SDK?: AmazonPayV2SDK;
    protected buttonParentContainer?: HTMLDivElement;
    protected amazonPayV2Button?: AmazonPayV2Button;
    protected isBuyNowFlow?: boolean;

    constructor(protected amazonPayV2ScriptLoader: AmazonPayV2ScriptLoader) {}

    async initialize(paymentMethod: PaymentMethod<AmazonPayV2InitializeOptions>): Promise<void> {
        this.amazonPayV2SDK = await this.amazonPayV2ScriptLoader.load(paymentMethod);
        this.buttonParentContainer =
            this.buttonParentContainer || this.createAmazonPayButtonParentContainer();
    }

    deinitialize(): Promise<void> {
        this.amazonPayV2Button = undefined;
        this.buttonParentContainer?.remove();
        this.buttonParentContainer = undefined;
        this.amazonPayV2SDK = undefined;

        return Promise.resolve();
    }

    createButton(containerId: string, options: AmazonPayV2ButtonParameters): void {
        this.amazonPayV2Button = this.getAmazonPayV2SDK().Pay.renderButton(
            `#${containerId}`,
            options,
        );
    }

    prepareCheckout(createCheckoutSessionConfig: Required<AmazonPayV2CheckoutSessionConfig>) {
        const requestConfig = this.prepareRequestConfig(createCheckoutSessionConfig);

        this.getAmazonPayV2Button().onClick(() => {
            this.getAmazonPayV2Button().initCheckout(requestConfig);
        });
    }

    protected prepareRequestConfig(
        createCheckoutSessionConfig: Required<AmazonPayV2CheckoutSessionConfig>,
        estimatedOrderAmount?: AmazonPayV2Price,
        productType?: AmazonPayV2PayOptions,
    ): RequestConfig {
        const { publicKeyId, ...signedPayload } = createCheckoutSessionConfig;

        return {
            createCheckoutSessionConfig: this.isEnvironmentSpecific(publicKeyId)
                ? signedPayload
                : createCheckoutSessionConfig,
            ...(estimatedOrderAmount && { estimatedOrderAmount }),
            ...(productType && { productType }),
        };
    }

    protected createAmazonPayButtonParentContainer(): HTMLDivElement {
        const uid = Math.random().toString(16).substr(-4);
        const parentContainer = document.createElement('div');

        parentContainer.id = `amazonpay_button_parent_container_${uid}`;

        return parentContainer;
    }

    protected isEnvironmentSpecific(publicKeyId: string): boolean {
        return /^(SANDBOX|LIVE)/.test(publicKeyId);
    }

    protected getAmazonPayV2SDK(): AmazonPayV2SDK {
        return this.getOrThrow(this.amazonPayV2SDK);
    }

    protected getButtonParentContainer(): HTMLDivElement {
        return this.getOrThrow(this.buttonParentContainer);
    }

    protected getAmazonPayV2Button(): AmazonPayV2Button {
        return this.getOrThrow(this.amazonPayV2Button);
    }

    protected getOrThrow<T>(value?: T): T {
        return guard(
            value,
            () => new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
        );
    }
}
