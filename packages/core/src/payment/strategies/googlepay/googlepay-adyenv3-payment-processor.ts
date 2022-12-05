import { some } from 'lodash';

import { Payment, PaymentActionCreator, PaymentInitializeOptions } from '../..';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    RequestError,
} from '../../../common/error/errors';
import { PaymentMethodCancelledError } from '../../errors';
import {
    AdyenAction,
    AdyenAdditionalAction,
    AdyenAdditionalActionState,
    AdyenClient,
    AdyenError,
    AdyenV3ScriptLoader,
} from '../adyenv3';

import { GooglePayProviderProcessor } from './googlepay';

export default class GooglePayAdyenV3PaymentProcessor implements GooglePayProviderProcessor {
    private _adyenClient?: AdyenClient;

    constructor(
        private _store: CheckoutStore,
        private _paymentActionCreator: PaymentActionCreator,
        private _scriptLoader: AdyenV3ScriptLoader,
    ) {}

    async initialize(options: PaymentInitializeOptions) {
        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(options.methodId);
        const storeConfig = state.config.getStoreConfig();

        if (!storeConfig) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        this._adyenClient = await this._scriptLoader.load({
            environment: paymentMethod.config.testMode ? 'test' : 'live',
            locale: storeConfig.storeProfile.storeLanguage,
            clientKey: paymentMethod.initializationData.clientKey,
            paymentMethodsResponse: paymentMethod.initializationData.paymentMethodsResponse,
        });
    }

    async processAdditionalAction(error: unknown): Promise<InternalCheckoutSelectors> {
        if (
            !(error instanceof RequestError) ||
            !some(error.body.errors, { code: 'additional_action_required' })
        ) {
            return Promise.reject(error);
        }

        const payment = await this._handleAction(error.body.provider_data);

        try {
            return await this._store.dispatch(this._paymentActionCreator.submitPayment(payment));
        } catch (error) {
            return this.processAdditionalAction(error);
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
                challengeWindowSize: '05',
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
