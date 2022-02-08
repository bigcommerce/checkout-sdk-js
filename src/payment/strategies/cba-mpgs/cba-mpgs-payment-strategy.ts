import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType, RequestError } from '../../../common/error/errors';
import { HostedFormFactory } from '../../../hosted-form';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { PaymentArgumentInvalidError, PaymentMethodDeclinedError, PaymentMethodFailedError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import { AdditionalActionRequired } from '../../payment-response-body';
import { CreditCardPaymentStrategy } from '../credit-card';

import { RestApiResponse, ThreeDSjs, THREE_D_SECURE_AVAILABLE, THREE_D_SECURE_BUSY, THREE_D_SECURE_PROCEED } from './cba-mpgs';
import CBAMPGSScriptLoader from './cba-mpgs-script-loader';

export default class CBAMPGSPaymentStrategy extends CreditCardPaymentStrategy {
    private _threeDSjs?: ThreeDSjs;
    private _sessionId?: string;

    constructor(
        store: CheckoutStore,
        orderActionCreator: OrderActionCreator,
        paymentActionCreator: PaymentActionCreator,
        hostedFormFactory: HostedFormFactory,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _CBAMGPSScriptLoader: CBAMPGSScriptLoader,
        private _locale: string
    ) {
        super(
            store,
            orderActionCreator,
            paymentActionCreator,
            hostedFormFactory
        );
    }

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        await super.initialize(options);

        const { methodId } = options;

        const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId));
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
        const { clientToken, initializationData: { merchantId }, config: { is3dsEnabled, testMode } } = paymentMethod;

        if (is3dsEnabled) {
            this._threeDSjs = await this._CBAMGPSScriptLoader.load(testMode);

            if (!this._threeDSjs) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            if (!clientToken || !merchantId ) {
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

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;
        const paymentData = payment && payment.paymentData;

        if (!payment || !paymentData) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        const { paymentMethods: { getPaymentMethodOrThrow } } = this._store.getState();
        const paymentMethod = getPaymentMethodOrThrow(payment.methodId);

        if (paymentMethod.config.is3dsEnabled) {
            await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

            const state = this._store.getState();
            const _order = state.order.getOrder();
            const { storeProfile: { storeId } } = state.config.getStoreConfigOrThrow();

            if (!_order || !this._sessionId) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckout);
            }

            const orderId = `${storeId}_${_order.orderId.toString()}`;

            // Debug Block, comment try/catch block
            // const transactionId = prompt('Transaction ID:', '');

            // return this._initiateAuthentication(orderId, transactionId || '');
            //

            try {
                return this._store.dispatch(this._paymentActionCreator.submitPayment({
                    ...payment,
                    paymentData: {
                        ...paymentData,
                        nonce: this._sessionId,
                    },
                }));
            } catch (error) {
                if (error instanceof RequestError && error.body.status === 'additional_action_required') {
                    const additionalActionRequired: AdditionalActionRequired = error.body.additional_action_required;
                    const transactionId = additionalActionRequired.data.transaction_id;

                    if (!transactionId) {
                        return Promise.reject(error);
                    }

                    return this._initiateAuthentication(orderId, transactionId);
                } else {
                    return Promise.reject(error);
                }
            } 
        } else {
            return super.execute(payload, options);
        }
    }

    private async _initiateAuthentication(orderId: string, transactionId: string): Promise<InternalCheckoutSelectors> {
        const response: RestApiResponse = await new Promise((resolve, reject) => {
            if (!this._threeDSjs) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            this._threeDSjs.initiateAuthentication(orderId, transactionId, data =>  {
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

        if (response.transaction && response.transaction.authenticationStatus === THREE_D_SECURE_AVAILABLE) {
            return this._authenticatePayer(orderId, transactionId);
        } else {
            throw new PaymentMethodDeclinedError();
        }
    }

    private async _authenticatePayer(orderId: string, transactionId: string): Promise<InternalCheckoutSelectors> {
        return await new Promise((_resolve, reject) => {
            if (!this._threeDSjs) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            this._threeDSjs.authenticatePayer(orderId, transactionId, data => {
                const error = data.error;

                if (error) {
                    if (error.cause && error.cause === THREE_D_SECURE_BUSY) {
                        return this._authenticatePayer(orderId, transactionId);
                    }

                    return reject(new PaymentMethodDeclinedError());
                }

                if (data.gatewayRecommendation !== THREE_D_SECURE_PROCEED) {
                    return reject(new PaymentMethodDeclinedError());
                }
            }, { fullScreenRedirect: true });
        });
    }
}
