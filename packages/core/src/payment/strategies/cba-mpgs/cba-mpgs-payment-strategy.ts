import { noop, some } from 'lodash';

import { PaymentMethodFailedError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    RequestError,
} from '../../../common/error/errors';
import { HostedFormFactory } from '../../../hosted-form';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError, PaymentMethodDeclinedError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import * as paymentStatusTypes from '../../payment-status-types';
import { CreditCardPaymentStrategy } from '../credit-card';

import {
    RestApiResponse,
    THREE_D_SECURE_AVAILABLE,
    THREE_D_SECURE_BUSY,
    THREE_D_SECURE_PROCEED,
    ThreeDSjs,
} from './cba-mpgs';
import CBAMPGSScriptLoader from './cba-mpgs-script-loader';

export default class CBAMPGSPaymentStrategy extends CreditCardPaymentStrategy {
    private _threeDSjs?: ThreeDSjs;
    private _sessionId = '';

    constructor(
        store: CheckoutStore,
        orderActionCreator: OrderActionCreator,
        paymentActionCreator: PaymentActionCreator,
        hostedFormFactory: HostedFormFactory,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _CBAMGPSScriptLoader: CBAMPGSScriptLoader,
        private _locale: string,
    ) {
        super(store, orderActionCreator, paymentActionCreator, hostedFormFactory);
    }

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        await super.initialize(options);

        const { methodId } = options;

        const state = await this._store.dispatch(
            this._paymentMethodActionCreator.loadPaymentMethod(methodId),
        );
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
        const {
            clientToken,
            initializationData: { isTestModeFlagEnabled = false, merchantId },
            config: { is3dsEnabled },
        } = paymentMethod;

        if (is3dsEnabled) {
            this._threeDSjs = await this._CBAMGPSScriptLoader.load(isTestModeFlagEnabled);

            if (!this._threeDSjs) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            if (!clientToken || !merchantId) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            }

            this._sessionId = clientToken;

            await this._threeDSjs.configure({
                merchantId,
                sessionId: this._sessionId,
                callback: () => {
                    if (this._threeDSjs?.isConfigured()) {
                        return this._store.getState();
                    }

                    throw new PaymentMethodFailedError('Failed to configure 3DS API.');
                },
                configuration: {
                    userLanguage: this._locale,
                    wsVersion: 62,
                },
            });
        }

        return Promise.resolve(this._store.getState());
    }

    async execute(
        payload: OrderRequestBody,
        options?: PaymentRequestOptions,
    ): Promise<InternalCheckoutSelectors> {
        const { payment } = payload;
        const paymentData = payment && payment.paymentData;

        if (!payment || !paymentData) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        const {
            paymentMethods: { getPaymentMethodOrThrow },
        } = this._store.getState();
        const paymentMethod = getPaymentMethodOrThrow(payment.methodId);

        const { is3dsEnabled } = paymentMethod.config;

        if (is3dsEnabled) {
            const newPaymentData = {
                ...paymentData,
                threeDSecure: { token: this._sessionId },
            };

            if (payload.payment) {
                payload.payment.paymentData = newPaymentData;
            }
        }

        return super.execute(payload, options).catch((error) => {
            if (
                !is3dsEnabled ||
                !(error instanceof RequestError) ||
                !some(error.body.errors, { code: 'three_d_secure_required' })
            ) {
                return Promise.reject(error);
            }

            const state = this._store.getState();
            const order = state.order.getOrder();
            const {
                storeProfile: { storeId },
            } = state.config.getStoreConfigOrThrow();

            if (!order || !this._sessionId) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckout);
            }

            const orderId = `${storeId}_${order.orderId}`;

            const {
                three_ds_result: { token: transactionId },
            } = error.body;

            if (!transactionId) {
                return Promise.reject(error);
            }

            return this._initiateAuthentication(orderId, transactionId);
        });
    }

    finalize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const order = state.order.getOrder();

        if (order && state.payment.getPaymentStatus() === paymentStatusTypes.FINALIZE) {
            return this._store.dispatch(
                this._orderActionCreator.finalizeOrder(order.orderId, options),
            );
        }

        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._threeDSjs = undefined;
        this._sessionId = '';

        return super.deinitialize();
    }

    private async _initiateAuthentication(
        orderId: string,
        transactionId: string,
    ): Promise<InternalCheckoutSelectors> {
        const response: RestApiResponse = await new Promise((resolve, reject) => {
            if (!this._threeDSjs) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            this._threeDSjs.initiateAuthentication(orderId, transactionId, (data) => {
                const error = data.error;

                if (error) {
                    return reject(new PaymentMethodDeclinedError(error.msg));
                }

                if (this._threeDSjs && data.gatewayRecommendation === THREE_D_SECURE_PROCEED) {
                    return resolve(data.restApiResponse);
                }

                return reject(new PaymentMethodDeclinedError());
            });
        });

        if (
            response.transaction &&
            response.transaction.authenticationStatus === THREE_D_SECURE_AVAILABLE
        ) {
            return this._authenticatePayer(orderId, transactionId);
        }

        throw new PaymentMethodDeclinedError();
    }

    private async _authenticatePayer(
        orderId: string,
        transactionId: string,
        attempt = 1,
    ): Promise<InternalCheckoutSelectors | never> {
        return new Promise((_resolve, reject) => {
            if (!this._threeDSjs) {
                return reject(
                    new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
                );
            }

            this._threeDSjs.authenticatePayer(
                orderId,
                transactionId,
                async (data) => {
                    const error = data.error;

                    if (error) {
                        if (error.cause && error.cause === THREE_D_SECURE_BUSY && attempt < 5) {
                            // Wait 3 seconds for MPGS server to process the `initiateAuthentication` call
                            // See: Step 1: Initiate Authentication ->  Initiate Authentication Request:
                            // https://ap-gateway.mastercard.com/api/documentation/integrationGuidelines/supportedFeatures/pickAdditionalFunctionality/authentication/3DS/integrationModelAPI.html?locale=en_US#x_3DSTest
                            await new Promise((resolve) => setTimeout(resolve, 3000));

                            return this._authenticatePayer(orderId, transactionId, ++attempt);
                        }

                        return reject(new PaymentMethodDeclinedError());
                    }

                    // ThreeDSjs will handle the redirect so return a promise that doesn't really resolve
                    return new Promise<never>(noop);
                },
                { fullScreenRedirect: true },
            );
        });
    }
}
