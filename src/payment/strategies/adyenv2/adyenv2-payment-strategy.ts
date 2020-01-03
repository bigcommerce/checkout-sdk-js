import { FormPoster } from '@bigcommerce/form-poster';
import { some } from 'lodash';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { getBrowserInfo } from '../../../common/browser-info';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType, RequestError } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError } from '../../errors';
import isVaultedInstrument from '../../is-vaulted-instrument';
import Payment, { HostedInstrument } from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { AdyenCardState, AdyenCheckout, AdyenComponent, AdyenConfiguration, AdyenError, ResultCode, ThreeDS2ComponentType, ThreeDS2OnComplete, ThreeDS2Result } from './adyenv2';
import AdyenV2PaymentInitializeOptions from './adyenv2-initialize-options';
import AdyenV2ScriptLoader from './adyenv2-script-loader';

export default class AdyenV2PaymentStrategy implements PaymentStrategy {
    private _adyenCheckout?: AdyenCheckout;
    private _adyenv2?: AdyenV2PaymentInitializeOptions;
    private _adyenPaymentComponent?: AdyenComponent;
    private _adyenCardVerificationComponent?: AdyenComponent;
    private _adyenComponentState?: AdyenCardState;

    constructor(
        private _store: CheckoutStore,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _adyenV2ScriptLoader: AdyenV2ScriptLoader,
        private _formPoster: FormPoster,
        private _locale: string
    ) {}

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { adyenv2 } = options;

        if (!adyenv2) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.adyenv2" argument is not provided.');
        }

        const paymentMethod = this._store.getState().paymentMethods.getPaymentMethod(options.methodId);

        if (!paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._adyenv2 = adyenv2;

        const configuration: AdyenConfiguration = {
            environment:  paymentMethod.initializationData.environment,
            locale: this._locale,
            originKey: paymentMethod.initializationData.originKey,
            paymentMethodsResponse: paymentMethod.initializationData.paymentMethodsResponse,
        };

        return this._adyenV2ScriptLoader.load(configuration)
            .then(adyenCheckout => {
                this._adyenCheckout = adyenCheckout;

                const adyenPaymentComponent = this._adyenCheckout.create(
                    paymentMethod.id,
                    {
                        ...adyenv2.options,
                        onChange: (state: AdyenCardState) => {
                            this._updateAdyenComponentState(state);
                        },
                    }
                );

                adyenPaymentComponent.mount(`#${adyenv2.containerId}`);

                this._adyenPaymentComponent = adyenPaymentComponent;

                if (adyenv2.cardVerificationContainerId) {
                    const adyenCardVerificationComponent = this._adyenCheckout.create('securedfields', {
                        onChange: (state: AdyenCardState) => {
                            this._updateAdyenComponentState(state);
                        },
                    });

                    adyenCardVerificationComponent.mount(`#${adyenv2.cardVerificationContainerId}`);

                    this._adyenCardVerificationComponent = adyenCardVerificationComponent;
                }

                return Promise.resolve(this._store.getState());
            });
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;
        const paymentData = payment && payment.paymentData;
        const shouldSaveInstrument = paymentData && (paymentData as HostedInstrument).shouldSaveInstrument;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
            .then(() => {
                const adyenComponentState = this._adyenComponentState;

                if (!adyenComponentState) {
                    throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
                }
                if (paymentData && isVaultedInstrument(paymentData)) {

                    const { encryptedCardNumber, encryptedSecurityCode } = adyenComponentState.data.paymentMethod;

                    return this._store.dispatch(this._paymentActionCreator.submitPayment({
                        ...payment,
                        paymentData: {
                            formattedPayload: {
                                bigpay_token: {
                                    credit_card_number_confirmation: encryptedCardNumber,
                                    token: paymentData.instrumentId,
                                    verification_value: encryptedSecurityCode,
                                },
                                browser_info: getBrowserInfo(),
                            },
                        },
                    }));
                }

                const paymentPayload = {
                    methodId: payment.methodId,
                    paymentData: {
                        formattedPayload: {
                            credit_card_token: {
                                token: JSON.stringify({
                                    ...adyenComponentState.data.paymentMethod,
                                    origin: window.location.origin,
                                }),
                            },
                            browser_info: getBrowserInfo(),
                            vault_payment_instrument: shouldSaveInstrument,
                        },
                    },
                };

                return this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
            })
            .catch(error => {
                if (!(error instanceof RequestError) || !some(error.body.errors, { code: 'three_d_secure_required' })) {
                    return Promise.reject(error);
                }

                if (error.body.three_ds_result.code === ResultCode.IdentifyShopper) {
                    return this._handle3DS2Fingerprint(error.body.three_ds_result, payment.methodId)
                        .then((payment: Payment) =>
                            this._store.dispatch(this._paymentActionCreator.submitPayment({
                                ...payment,
                                paymentData: {
                                    ...payment.paymentData,
                                    shouldSaveInstrument,
                                },
                            })))
                        .catch(error => {
                            if (!(error instanceof RequestError) || !some(error.body.errors, { code: 'three_d_secure_required' })) {
                                return Promise.reject(error);
                            }

                            if (error.body.three_ds_result.code === ResultCode.ChallengeShopper) {
                                return this._handle3DS2Challenge(error.body.three_ds_result, payment.methodId)
                                    .then((payment: Payment) =>
                                        this._store.dispatch(this._paymentActionCreator.submitPayment({
                                            ...payment,
                                            paymentData: {
                                                ...payment.paymentData,
                                                shouldSaveInstrument,
                                            },
                                        }))
                                    );
                            }

                            return Promise.reject(error);
                        });
                }

                if (error.body.three_ds_result.code === ResultCode.ChallengeShopper) {
                    return this._handle3DS2Challenge(error.body.three_ds_result, payment.methodId)
                        .then((payment: Payment) =>
                            this._store.dispatch(this._paymentActionCreator.submitPayment({
                                ...payment,
                                paymentData: {
                                    ...payment.paymentData,
                                    shouldSaveInstrument,
                                },
                            }))
                        );
                }

                return new Promise(() => {
                    this._formPoster.postForm(error.body.three_ds_result.acs_url, {
                        PaReq: error.body.three_ds_result.payer_auth_request,
                        TermUrl: error.body.three_ds_result.callback_url,
                        MD: error.body.three_ds_result.merchant_data,
                    });
                });
            });
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        if (this._adyenPaymentComponent) {
            this._adyenPaymentComponent.unmount();
            this._adyenPaymentComponent = undefined;
        }

        if (this._adyenCardVerificationComponent) {
            this._adyenCardVerificationComponent.unmount();
            this._adyenCardVerificationComponent = undefined;
        }

        return Promise.resolve(this._store.getState());
    }

    private _getAdyenV2PaymentInitializeOptions(): AdyenV2PaymentInitializeOptions {
        if (!this._adyenv2) {
            throw new InvalidArgumentError('"options.adyenv2" argument was not provided during initialization.');
        }

        return this._adyenv2;
    }

    private _getThreeDS2ChallengeWidgetSize(): string {
        const { widgetSize } = this._getAdyenV2PaymentInitializeOptions().threeDS2Options;

        if (!widgetSize) {
            return '01';
        }

        return widgetSize;
    }

    private _handle3DS2Challenge(resultObject: ThreeDS2Result, paymentMethodId: string): Promise<Payment> {
        return new Promise((resolve, reject) => {
            if (!this._adyenCheckout) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            const { onComplete, onLoad } = this._getAdyenV2PaymentInitializeOptions().threeDS2Options;

            const challengeComponent = this._adyenCheckout
                .create(ThreeDS2ComponentType.ThreeDS2Challenge, {
                    challengeToken: resultObject.token,
                    onComplete: (challengeData: ThreeDS2OnComplete) => {
                        const challengePaymentPayload = {
                            ...challengeData.data,
                            paymentData: resultObject.payment_data,
                        };

                        const paymentPayload = {
                            methodId: paymentMethodId,
                            paymentData: {
                                nonce: JSON.stringify(challengePaymentPayload),
                            },
                        };

                        onComplete();

                        resolve(paymentPayload);
                    },
                    onError: (error: AdyenError) => reject(error),
                    size: this._getThreeDS2ChallengeWidgetSize(),
                });

            const threeDS2Container = this._getAdyenV2PaymentInitializeOptions().threeDS2ContainerId;

            onLoad(() => {
                challengeComponent.unmount();
                reject();
            });

            challengeComponent.mount(`#${threeDS2Container}`);
        });
    }

    private _handle3DS2Fingerprint(resultObject: ThreeDS2Result, paymentMethodId: string): Promise<Payment> {
        return new Promise((resolve, reject) => {
            if (!this._adyenCheckout) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            const { onComplete, onLoad } = this._getAdyenV2PaymentInitializeOptions().threeDS2Options;

            const fingerprintComponent = this._adyenCheckout
                .create(ThreeDS2ComponentType.ThreeDS2DeviceFingerprint, {
                    fingerprintToken: resultObject.token,
                    onComplete: (fingerprintData: ThreeDS2OnComplete) => {
                        const fingerprintPaymentPayload = {
                            ...fingerprintData.data,
                            paymentData: resultObject.payment_data,
                        };

                        const paymentPayload = {
                            methodId: paymentMethodId,
                            paymentData: {
                                nonce: JSON.stringify(fingerprintPaymentPayload),
                            },
                        };

                        onComplete();

                        resolve(paymentPayload);
                    },
                    onError: (error: AdyenError) => reject(error),
                });

            const threeDS2Container = this._getAdyenV2PaymentInitializeOptions().threeDS2ContainerId;

            onLoad(() => {
                fingerprintComponent.unmount();
                reject();
            });

            fingerprintComponent.mount(`#${threeDS2Container}`);
        });
    }

    private _updateAdyenComponentState(newState: AdyenCardState) {
        this._adyenComponentState = newState;
    }
}
