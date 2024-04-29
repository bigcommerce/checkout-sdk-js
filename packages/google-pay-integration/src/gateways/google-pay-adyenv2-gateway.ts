import {
    AdyenAction,
    AdyenAdditionalAction,
    AdyenAdditionalActionState,
    AdyenClient,
    AdyenError,
    AdyenV2ScriptLoader,
    isAdditionalActionRequiredErrorResponse,
} from '@bigcommerce/checkout-sdk/adyen-utils';
import {
    getBrowserInfo,
    isRequestError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    Payment,
    PaymentIntegrationSelectors,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodCancelledError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { GooglePayInitializationData } from '../types';

import GooglePayGateway from './google-pay-gateway';

export default class GooglePayAdyenV2 extends GooglePayGateway {
    private _adyenClient?: AdyenClient;
    private _service: PaymentIntegrationService;

    constructor(service: PaymentIntegrationService, private _scriptLoader: AdyenV2ScriptLoader) {
        super('adyen', service);

        this._service = service;
    }

    async initialize(
        getPaymentMethod: () => PaymentMethod<GooglePayInitializationData>,
        isBuyNowFlow?: boolean,
        currencyCode?: string,
    ): Promise<void> {
        await super.initialize(getPaymentMethod, isBuyNowFlow, currencyCode);

        const paymentMethod = super.getPaymentMethod();
        const state = this._service.getState();
        const storeConfig = state.getStoreConfig();

        if (!storeConfig) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        this._adyenClient = await this._scriptLoader.load({
            environment: paymentMethod.config.testMode ? 'test' : 'live',
            locale: storeConfig.storeProfile.storeLanguage,
        });

        return Promise.resolve();
    }

    async getNonce(methodId: string) {
        const nonce = await super.getNonce(methodId);
        const paymentMethod = super.getPaymentMethod();

        return JSON.stringify({
            type: paymentMethod.method,
            googlePayToken: nonce,
            browser_info: getBrowserInfo(),
        });
    }

    async processAdditionalAction(error: unknown): Promise<PaymentIntegrationSelectors | void> {
        if (!isRequestError(error) || !isAdditionalActionRequiredErrorResponse(error.body)) {
            throw error;
        }

        const payment = await this._handleAction(error.body.provider_data);

        try {
            return await this._service.submitPayment(payment);
        } catch (e) {
            return this.processAdditionalAction(e);
        }
    }

    private _handleAction(additionalAction: AdyenAdditionalAction): Promise<Payment> {
        return new Promise((resolve, reject) => {
            const adyenAction: AdyenAction = JSON.parse(additionalAction.action);

            const additionalActionComponent = this._getAdyenClient().createFromAction(adyenAction, {
                onAdditionalDetails: (additionalActionState: AdyenAdditionalActionState) => {
                    const paymentPayload = {
                        methodId: adyenAction.paymentMethodType,
                        paymentData: {
                            nonce: JSON.stringify(additionalActionState.data),
                        },
                    };

                    resolve(paymentPayload);
                },
                size: '05',
                onError: (error: AdyenError) => reject(error),
            });

            additionalActionComponent.mount('body');

            reject(new PaymentMethodCancelledError());
        });
    }

    private _getAdyenClient(): AdyenClient {
        if (!this._adyenClient) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._adyenClient;
    }
}
