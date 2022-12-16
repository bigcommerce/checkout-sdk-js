import { PaymentMethod } from '../..';
import { InternalCheckoutSelectors } from '../../../../../core/src/checkout';
import { getShippableItemsCount } from '../../../../../core/src/shipping';
import { guard } from '../../../../src/common/utility';
import { StoreProfile } from '../../../../src/config';
import { CheckoutSettings } from '../../../../src/config/config';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
} from '../../../common/error/errors';

import {
    AmazonPayV2Button,
    AmazonPayV2ButtonColor,
    AmazonPayV2ButtonParameters,
    AmazonPayV2ButtonRenderingOptions,
    AmazonPayV2ChangeActionType,
    AmazonPayV2CheckoutSessionConfig,
    AmazonPayV2NewButtonParams,
    AmazonPayV2PayOptions,
    AmazonPayV2Placement,
    AmazonPayV2SDK,
} from './amazon-pay-v2';
import AmazonPayV2ScriptLoader from './amazon-pay-v2-script-loader';

export default class AmazonPayV2PaymentProcessor {
    private _amazonPayV2SDK?: AmazonPayV2SDK;
    private _buttonParentContainer?: HTMLDivElement;
    private _amazonPayV2Button?: AmazonPayV2Button;

    constructor(private _amazonPayV2ScriptLoader: AmazonPayV2ScriptLoader) {}

    async initialize(paymentMethod: PaymentMethod): Promise<void> {
        this._amazonPayV2SDK = await this._amazonPayV2ScriptLoader.load(paymentMethod);
        this._buttonParentContainer =
            this._buttonParentContainer || this._createAmazonPayButtonParentContainer();
    }

    deinitialize(): Promise<void> {
        this._amazonPayV2Button = undefined;
        this._buttonParentContainer?.remove();
        this._buttonParentContainer = undefined;
        this._amazonPayV2SDK = undefined;

        return Promise.resolve();
    }

    bindButton(
        buttonId: string,
        sessionId: string,
        changeAction: AmazonPayV2ChangeActionType,
    ): void {
        this._getAmazonPayV2SDK().Pay.bindChangeAction(`#${buttonId}`, {
            amazonCheckoutSessionId: sessionId,
            changeAction,
        });
    }

    createButton(containerId: string, options: AmazonPayV2ButtonParameters): void {
        this._amazonPayV2Button = this._getAmazonPayV2SDK().Pay.renderButton(
            `#${containerId}`,
            options,
        );
    }

    prepareCheckout(createCheckoutSessionConfig: Required<AmazonPayV2CheckoutSessionConfig>): void {
        const { publicKeyId, ...signedPayload } = createCheckoutSessionConfig;

        const requestConfig = {
            createCheckoutSessionConfig: this._isEnvironmentSpecific(publicKeyId)
                ? signedPayload
                : createCheckoutSessionConfig,
        };

        this._getAmazonPayV2Button().onClick(() =>
            this._getAmazonPayV2Button().initCheckout(requestConfig),
        );
    }

    async signout(): Promise<void> {
        if (this._amazonPayV2SDK) {
            this._amazonPayV2SDK.Pay.signout();
        }

        return Promise.resolve();
    }

    renderAmazonPayButton({
        checkoutState,
        containerId,
        decoupleCheckoutInitiation = false,
        methodId,
        options,
        placement,
    }: AmazonPayV2ButtonRenderingOptions): HTMLDivElement {
        const container = document.querySelector<HTMLElement>(`#${containerId}`);

        if (!container) {
            throw new InvalidArgumentError(
                'Unable to render the Amazon Pay button to an invalid HTML container element.',
            );
        }

        const { id: parentContainerId } = container.appendChild(this._getButtonParentContainer());

        const amazonPayV2ButtonOptions =
            options ??
            this._getAmazonPayV2ButtonOptions(
                checkoutState,
                methodId,
                placement,
                decoupleCheckoutInitiation,
            );

        this.createButton(parentContainerId, amazonPayV2ButtonOptions);

        return this._getButtonParentContainer();
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

    private _createAmazonPayButtonParentContainer(): HTMLDivElement {
        const uid = Math.random().toString(16).substr(-4);
        const parentContainer = document.createElement('div');

        parentContainer.id = `amazonpay_button_parent_container_${uid}`;

        return parentContainer;
    }

    private _getAmazonPayV2ButtonOptions(
        {
            cart: { getCart },
            checkout: { getCheckout },
            config: { getStoreConfigOrThrow },
            paymentMethods: { getPaymentMethodOrThrow },
        }: InternalCheckoutSelectors,
        methodId: string,
        placement: AmazonPayV2Placement,
        decoupleCheckoutInitiation = false,
    ): AmazonPayV2ButtonParameters {
        const {
            config: { merchantId, testMode },
            initializationData: {
                checkoutLanguage,
                checkoutSessionMethod,
                createCheckoutSessionConfig,
                extractAmazonCheckoutSessionId,
                ledgerCurrency,
                publicKeyId,
            },
        } = getPaymentMethodOrThrow(methodId);

        const {
            checkoutSettings: { features },
            storeProfile: { shopPath, storeCountryCode },
        } = getStoreConfigOrThrow();

        const cart = getCart();

        if (!merchantId || !ledgerCurrency) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const buttonBaseConfig = {
            merchantId,
            ledgerCurrency,
            checkoutLanguage,
            productType:
                cart && getShippableItemsCount(cart) === 0
                    ? AmazonPayV2PayOptions.PayOnly
                    : AmazonPayV2PayOptions.PayAndShip,
            placement,
            buttonColor: AmazonPayV2ButtonColor.Gold,
        };

        if (this.isPh4Enabled(features, storeCountryCode)) {
            const amount = getCheckout()?.outstandingBalance.toString();
            const currencyCode = cart?.currency.code;
            const buttonOptions: AmazonPayV2NewButtonParams = { ...buttonBaseConfig };
            let tmpConfig: AmazonPayV2CheckoutSessionConfig;

            if (this._isEnvironmentSpecific(publicKeyId)) {
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

    private _isEnvironmentSpecific(publicKeyId: string): boolean {
        return /^(SANDBOX|LIVE)/.test(publicKeyId);
    }

    private _getAmazonPayV2SDK(): AmazonPayV2SDK {
        return this._getOrThrow(this._amazonPayV2SDK);
    }

    private _getButtonParentContainer(): HTMLDivElement {
        return this._getOrThrow(this._buttonParentContainer);
    }

    private _getAmazonPayV2Button(): AmazonPayV2Button {
        return this._getOrThrow(this._amazonPayV2Button);
    }

    private _getOrThrow<T>(value?: T): T {
        return guard(
            value,
            () => new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
        );
    }
}
