import { noop, some } from 'lodash';

import { CreditCardPaymentStrategy } from '@bigcommerce/checkout-sdk/credit-card-integration';
import {
    isRequestError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethodFailedError,
    PaymentRequestOptions,
    PaymentStatusTypes,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    RestApiResponse,
    THREE_D_SECURE_AVAILABLE,
    THREE_D_SECURE_BUSY,
    THREE_D_SECURE_PROCEED,
    ThreeDSjs,
} from './cba-mpgs';
import CBAMPGSScriptLoader from './cba-mpgs-script-loader';
import { isCBAMPGSPaymentMethodLike, isThreeDSErrorBody } from './is-cba-mpgs-payment-method-like';

export default class CBAMPGSPaymentStrategy extends CreditCardPaymentStrategy {
    private threeDSjs?: ThreeDSjs;

    private sessionId = '';
    private locale?: string;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private cbaMGPSScriptLoader: CBAMPGSScriptLoader,
    ) {
        super(paymentIntegrationService);
    }

    async initialize(options: PaymentInitializeOptions): Promise<void> {
        await super.initialize(options);

        const { methodId } = options;

        await this.paymentIntegrationService.loadPaymentMethod(methodId);

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow(methodId);

        if (!isCBAMPGSPaymentMethodLike(paymentMethod)) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const {
            clientToken,
            initializationData: { isTestModeFlagEnabled = false, merchantId },
            config: { is3dsEnabled },
        } = paymentMethod;

        if (is3dsEnabled) {
            this.threeDSjs = await this.cbaMGPSScriptLoader.load(isTestModeFlagEnabled);

            if (!this.threeDSjs) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            if (!clientToken || !merchantId) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            }

            this.sessionId = clientToken;
            this.locale = state.getLocale();

            if (!this.locale) {
                throw new MissingDataError(MissingDataErrorType.MissingCart);
            }

            await this.threeDSjs.configure({
                merchantId,
                sessionId: this.sessionId,
                callback: () => {
                    if (this.threeDSjs?.isConfigured()) {
                        return this.paymentIntegrationService.getState();
                    }

                    throw new PaymentMethodFailedError('Failed to configure 3DS API.');
                },
                configuration: {
                    userLanguage: this.locale,
                    wsVersion: 62,
                },
            });
        }

        return Promise.resolve();
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment } = payload;
        const paymentData = payment && payment.paymentData;

        if (!payment || !paymentData) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow(payment.methodId);

        const { is3dsEnabled } = paymentMethod.config;

        if (is3dsEnabled) {
            const newPaymentData = {
                ...paymentData,
                threeDSecure: { token: this.sessionId },
            };

            if (payload.payment) {
                payload.payment.paymentData = newPaymentData;
            }
        }

        return super.execute(payload, options).catch((error) => {
            if (
                !is3dsEnabled ||
                !isRequestError(error) ||
                !some(error.body.errors, { code: 'three_d_secure_required' })
            ) {
                return Promise.reject(error);
            }

            const retryState = this.paymentIntegrationService.getState();
            const order = retryState.getOrder();

            const {
                storeProfile: { storeId },
            } = retryState.getStoreConfigOrThrow();

            if (!order || !this.sessionId) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckout);
            }

            const orderId = `${storeId}_${order.orderId}`;

            if (!isThreeDSErrorBody(error.body)) {
                throw new RequestError();
            }

            const {
                three_ds_result: { token: transactionId },
            } = error.body;

            if (!transactionId) {
                return Promise.reject(error);
            }

            return this.initiateAuthentication(orderId, transactionId);
        });
    }

    async finalize(options?: PaymentRequestOptions): Promise<void> {
        const state = this.paymentIntegrationService.getState();
        const order = state.getOrder();

        if (order && state.getPaymentStatus() === PaymentStatusTypes.FINALIZE) {
            await this.paymentIntegrationService.finalizeOrder(options);

            return Promise.resolve();
        }

        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        this.threeDSjs = undefined;
        this.sessionId = '';

        return super.deinitialize();
    }

    private async initiateAuthentication(orderId: string, transactionId: string): Promise<void> {
        const response: RestApiResponse = await new Promise((resolve, reject) => {
            if (!this.threeDSjs) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            this.threeDSjs.initiateAuthentication(orderId, transactionId, (data) => {
                const error = data.error;

                if (error) {
                    return reject(new PaymentMethodFailedError(error.msg));
                }

                if (this.threeDSjs && data.gatewayRecommendation === THREE_D_SECURE_PROCEED) {
                    return resolve(data.restApiResponse);
                }

                return reject(new PaymentMethodFailedError());
            });
        });

        if (
            response.transaction &&
            response.transaction.authenticationStatus === THREE_D_SECURE_AVAILABLE
        ) {
            return this.authenticatePayer(orderId, transactionId);
        }

        throw new PaymentMethodFailedError();
    }

    private async authenticatePayer(
        orderId: string,
        transactionId: string,
        attempt = 1,
    ): Promise<void> {
        return new Promise((_resolve, reject) => {
            if (!this.threeDSjs) {
                return reject(
                    new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
                );
            }

            this.threeDSjs.authenticatePayer(
                orderId,
                transactionId,
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                async (data) => {
                    const error = data.error;

                    if (error) {
                        if (error.cause && error.cause === THREE_D_SECURE_BUSY && attempt < 5) {
                            // Wait 3 seconds for MPGS server to process the `initiateAuthentication` call
                            // See: Step 1: Initiate Authentication ->  Initiate Authentication Request:
                            // https://ap-gateway.mastercard.com/api/documentation/integrationGuidelines/supportedFeatures/pickAdditionalFunctionality/authentication/3DS/integrationModelAPI.html?locale=en_US#x_3DSTest
                            await new Promise((resolve) => setTimeout(resolve, 3000));

                            // eslint-disable-next-line no-plusplus, no-param-reassign
                            return this.authenticatePayer(orderId, transactionId, ++attempt);
                        }

                        return reject(new PaymentMethodFailedError());
                    }

                    // ThreeDSjs will handle the redirect so return a promise that doesn't really resolve
                    return new Promise<never>(noop);
                },
                { fullScreenRedirect: true },
            );
        });
    }
}
