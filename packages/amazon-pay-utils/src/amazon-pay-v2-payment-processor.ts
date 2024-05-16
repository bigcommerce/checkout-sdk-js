import {
    CheckoutSettings,
    getShippableItemsCount,
    guard,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    PaymentMethod,
    StoreProfile,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    AmazonPayV2Button,
    AmazonPayV2ButtonColor,
    AmazonPayV2ButtonConfig,
    AmazonPayV2ButtonDesign,
    AmazonPayV2ButtonParameters,
    AmazonPayV2ButtonRenderingOptions,
    AmazonPayV2ChangeActionType,
    AmazonPayV2CheckoutSessionConfig,
    AmazonPayV2InitializeOptions,
    AmazonPayV2NewButtonParams,
    AmazonPayV2PayOptions,
    AmazonPayV2Placement,
    AmazonPayV2Price,
    AmazonPayV2SDK,
    InternalCheckoutSelectors,
    RequestConfig,
} from './amazon-pay-v2';
import AmazonPayV2ScriptLoader from './amazon-pay-v2-script-loader';

export default class AmazonPayV2PaymentProcessor {
    private amazonPayV2SDK?: AmazonPayV2SDK;
    private buttonParentContainer?: HTMLDivElement;
    private amazonPayV2Button?: AmazonPayV2Button;
    private isBuyNowFlow?: boolean;

    constructor(private amazonPayV2ScriptLoader: AmazonPayV2ScriptLoader) {}

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

    bindButton(
        buttonId: string,
        sessionId: string,
        changeAction: AmazonPayV2ChangeActionType,
    ): void {
        this.getAmazonPayV2SDK().Pay.bindChangeAction(`#${buttonId}`, {
            amazonCheckoutSessionId: sessionId,
            changeAction,
        });
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

    prepareCheckoutWithCreationRequestConfig(
        createCheckoutConfig: () => Promise<
            | {
                  createCheckoutSessionConfig: Required<AmazonPayV2CheckoutSessionConfig>;
                  estimatedOrderAmount: AmazonPayV2Price;
                  productType: AmazonPayV2PayOptions;
              }
            | undefined
        >,
    ) {
        this.getAmazonPayV2Button().onClick(async () => {
            const config = await createCheckoutConfig();

            if (config) {
                const requestConfig = this.prepareRequestConfig(
                    config.createCheckoutSessionConfig,
                    config.estimatedOrderAmount,
                    config.productType,
                );

                this.getAmazonPayV2Button().initCheckout(requestConfig);
            }
        });
    }

    async signout(): Promise<void> {
        if (this.amazonPayV2SDK) {
            this.amazonPayV2SDK.Pay.signout();
        }

        return Promise.resolve();
    }

    renderAmazonPayButton({
        buttonColor,
        checkoutState,
        containerId,
        decoupleCheckoutInitiation = false,
        methodId,
        options,
        placement,
        isButtonMicroTextDisabled = false,
    }: AmazonPayV2ButtonRenderingOptions): HTMLDivElement {
        const container = document.querySelector<HTMLElement>(`#${containerId}`);

        if (!container) {
            throw new InvalidArgumentError(
                'Unable to render the Amazon Pay button to an invalid HTML container element.',
            );
        }

        const { id: parentContainerId } = container.appendChild(this.getButtonParentContainer());

        if (options && isButtonMicroTextDisabled) {
            options.design = AmazonPayV2ButtonDesign.C0001;
        }

        const amazonPayV2ButtonOptions =
            options ??
            this.getAmazonPayV2ButtonOptions(
                checkoutState,
                methodId,
                placement,
                decoupleCheckoutInitiation,
                buttonColor,
            );

        this.createButton(parentContainerId, amazonPayV2ButtonOptions);

        return this.getButtonParentContainer();
    }

    updateBuyNowFlowFlag(isBuyNowFlow?: boolean) {
        this.isBuyNowFlow = Boolean(isBuyNowFlow);
    }

    /**
     * @internal
     */
    isPh4Enabled(
        features: CheckoutSettings['features'],
        storeCountryCode: StoreProfile['storeCountryCode'],
    ): boolean {
        const isPh4Enabled = !!features['PROJECT-3483.amazon_pay_ph4'];
        const isPh4UsOnly = !!features['INT-6885.amazon_pay_ph4_us_only'];

        if (isPh4Enabled && isPh4UsOnly) {
            return storeCountryCode === 'US';
        }

        return isPh4Enabled;
    }

    private prepareRequestConfig(
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

    private createAmazonPayButtonParentContainer(): HTMLDivElement {
        const uid = Math.random().toString(16).substr(-4);
        const parentContainer = document.createElement('div');

        parentContainer.id = `amazonpay_button_parent_container_${uid}`;

        return parentContainer;
    }

    private getAmazonPayV2ButtonOptions(
        {
            cart: { getCart },
            checkout: { getCheckout },
            config: { getStoreConfigOrThrow },
            paymentMethods: { getPaymentMethodOrThrow },
        }: InternalCheckoutSelectors,
        methodId: string,
        placement: AmazonPayV2Placement,
        decoupleCheckoutInitiation = false,
        buttonColor = AmazonPayV2ButtonColor.Gold,
    ): AmazonPayV2ButtonParameters {
        const {
            config: { merchantId, testMode },
            initializationData,
        } = getPaymentMethodOrThrow(methodId);

        if (!initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const {
            checkoutLanguage,
            checkoutSessionMethod,
            createCheckoutSessionConfig,
            extractAmazonCheckoutSessionId,
            ledgerCurrency,
            publicKeyId = '',
            isButtonMicroTextDisabled,
        } = initializationData;

        if (!merchantId || !ledgerCurrency || !createCheckoutSessionConfig) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const buttonBaseConfig: AmazonPayV2ButtonConfig = {
            merchantId,
            ledgerCurrency,
            checkoutLanguage,
            placement,
            buttonColor,
            ...(isButtonMicroTextDisabled ? { design: AmazonPayV2ButtonDesign.C0001 } : {}),
        };

        if (this.isBuyNowFlow) {
            return {
                ...buttonBaseConfig,
                sandbox: !!testMode,
            };
        }

        const cart = getCart();

        buttonBaseConfig.productType =
            cart && getShippableItemsCount(cart) === 0
                ? AmazonPayV2PayOptions.PayOnly
                : AmazonPayV2PayOptions.PayAndShip;

        const {
            checkoutSettings: { features },
            storeProfile: { shopPath, storeCountryCode },
        } = getStoreConfigOrThrow();

        if (this.isPh4Enabled(features, storeCountryCode)) {
            const amount = getCheckout()?.outstandingBalance.toString();
            const currencyCode = cart?.currency.code;
            const buttonOptions: AmazonPayV2NewButtonParams = { ...buttonBaseConfig };
            let tmpConfig: AmazonPayV2CheckoutSessionConfig;

            if (this.isEnvironmentSpecific(publicKeyId)) {
                buttonOptions.publicKeyId = publicKeyId;
                tmpConfig = createCheckoutSessionConfig;
            } else {
                buttonOptions.sandbox = !!testMode;
                tmpConfig = { ...createCheckoutSessionConfig, publicKeyId };
            }

            if (!decoupleCheckoutInitiation) {
                buttonOptions.createCheckoutSessionConfig = tmpConfig;
            }

            if (amount && currencyCode) {
                buttonOptions.estimatedOrderAmount = { amount, currencyCode };
            }

            return buttonOptions;
        }

        const createCheckoutSession = {
            method: checkoutSessionMethod,
            url: features['INT-5826.amazon_relative_url']
                ? `/remote-checkout/${methodId}/payment-session`
                : `${shopPath}/remote-checkout/${methodId}/payment-session`,
            extractAmazonCheckoutSessionId,
        };

        return {
            ...buttonBaseConfig,
            createCheckoutSession,
            sandbox: !!testMode,
        };
    }

    private isEnvironmentSpecific(publicKeyId: string): boolean {
        return /^(SANDBOX|LIVE)/.test(publicKeyId);
    }

    private getAmazonPayV2SDK(): AmazonPayV2SDK {
        return this.getOrThrow(this.amazonPayV2SDK);
    }

    private getButtonParentContainer(): HTMLDivElement {
        return this.getOrThrow(this.buttonParentContainer);
    }

    private getAmazonPayV2Button(): AmazonPayV2Button {
        return this.getOrThrow(this.amazonPayV2Button);
    }

    private getOrThrow<T>(value?: T): T {
        return guard(
            value,
            () => new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
        );
    }
}
