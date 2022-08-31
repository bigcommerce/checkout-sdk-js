import { PaymentMethod } from '../..';
import { InternalCheckoutSelectors } from '../../../../../core/src/checkout';
import { getShippableItemsCount } from '../../../../../core/src/shipping';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';

import { AmazonPayV2ButtonColor, AmazonPayV2ChangeActionType, AmazonPayV2PayOptions, AmazonPayV2Placement, AmazonPayV2SDK, AmazonPayV2ButtonParameters } from './amazon-pay-v2';
import AmazonPayV2ScriptLoader from './amazon-pay-v2-script-loader';

export default class AmazonPayV2PaymentProcessor {
    private _amazonPayV2SDK?: AmazonPayV2SDK;

    constructor(
        private _amazonPayV2ScriptLoader: AmazonPayV2ScriptLoader
    ) { }

    async initialize(paymentMethod: PaymentMethod): Promise<void> {
        this._amazonPayV2SDK = await this._amazonPayV2ScriptLoader.load(paymentMethod);
    }

    deinitialize(): Promise<void> {
        this._amazonPayV2SDK = undefined;

        return Promise.resolve();
    }

    bindButton(buttonId: string, sessionId: string, changeAction: AmazonPayV2ChangeActionType): void {
        this._getAmazonPayV2SDK().Pay.bindChangeAction(`#${buttonId}`, {
            amazonCheckoutSessionId: sessionId,
            changeAction,
        });
    }

    createButton(containerId: string, options: AmazonPayV2ButtonParameters): HTMLElement {
        return this._getAmazonPayV2SDK().Pay.renderButton(`#${containerId}`, options);
    }

    async signout(): Promise<void> {
        if (this._amazonPayV2SDK) {
            this._amazonPayV2SDK.Pay.signout();
        }

        return Promise.resolve();
    }

    renderAmazonPayButton(
        containerId: string,
        checkoutState: InternalCheckoutSelectors,
        methodId: string,
        placement: AmazonPayV2Placement,
        options?: AmazonPayV2ButtonParameters
    ): HTMLElement {
        const container = document.getElementById(containerId);

        if (!container) {
            throw new InvalidArgumentError('Unable to render the Amazon Pay button to an invalid HTML container element.');
        }

        const amazonPayV2ButtonOptions = options ?? this._getAmazonPayV2ButtonOptions(checkoutState, methodId, placement);

        this.createButton(containerId, amazonPayV2ButtonOptions);

        return container;
    }

    private _getAmazonPayV2ButtonOptions(
        {
            cart: { getCart },
            checkout: { getCheckout },
            config: { getStoreConfigOrThrow },
            paymentMethods: { getPaymentMethodOrThrow },
        }: InternalCheckoutSelectors,
        methodId: string,
        placement: AmazonPayV2Placement
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
            storeProfile: { shopPath },
        } = getStoreConfigOrThrow();

        const cart = getCart();

        if (!merchantId || !ledgerCurrency) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const buttonBaseConfig = {
            merchantId,
            ledgerCurrency,
            checkoutLanguage,
            productType: cart && getShippableItemsCount(cart) === 0 ?
                AmazonPayV2PayOptions.PayOnly :
                AmazonPayV2PayOptions.PayAndShip,
            placement,
            buttonColor: AmazonPayV2ButtonColor.Gold,
        };

        if (features['PROJECT-3483.amazon_pay_ph4']) {
            const amount = getCheckout()?.outstandingBalance.toString();
            const currencyCode = cart?.currency.code;
            const buttonOptions = /^(SANDBOX|LIVE)/.test(publicKeyId)
                ? {
                      ...buttonBaseConfig,
                      publicKeyId,
                      createCheckoutSessionConfig,
                  }
                : {
                      ...buttonBaseConfig,
                      sandbox: !!testMode,
                      createCheckoutSessionConfig: {
                          ...createCheckoutSessionConfig,
                          publicKeyId,
                      },
                  };

            return amount && currencyCode
                ? {
                      ...buttonOptions,
                      estimatedOrderAmount: {
                          amount,
                          currencyCode,
                      },
                  }
                : buttonOptions;
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

    private _getAmazonPayV2SDK(): AmazonPayV2SDK {
        if (!this._amazonPayV2SDK) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._amazonPayV2SDK;
    }
}
