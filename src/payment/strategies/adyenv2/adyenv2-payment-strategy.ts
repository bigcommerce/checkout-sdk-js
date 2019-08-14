import { FormPoster } from '@bigcommerce/form-poster';
import { some } from 'lodash';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    RequestError
} from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError } from '../../errors';
import Payment from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { AdyenV2PaymentInitializeOptions } from '.';
import {
    AdyenCardState,
    AdyenCheckout,
    AdyenComponent,
    AdyenConfiguration,
    AdyenError,
    ResultCode,
    ThreeDS2ChallengeWidgetSize,
    ThreeDS2ComponentType,
    ThreeDS2Result
} from './adyenv2';
import AdyenV2ScriptLoader from './adyenv2-script-loader';

export default class AdyenV2PaymentStrategy implements PaymentStrategy {
    private _adyenCheckout?: AdyenCheckout;
    private _adyenComponent?: AdyenComponent;
    private _stateContainer?: string;
    private _adyenv2?: AdyenV2PaymentInitializeOptions;

    constructor(
        private _store: CheckoutStore,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _adyenV2ScriptLoader: AdyenV2ScriptLoader,
        private _formPoster: FormPoster

    ) {}

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { adyenv2 } = options;

        if (!adyenv2) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.adyen" argument is not provided.');
        }

        const paymentMethod = this._store.getState().paymentMethods.getPaymentMethod(options.methodId);

        if (!paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._adyenv2 = adyenv2;

        const configuration: AdyenConfiguration = {
            environment:  paymentMethod.initializationData.environment,
            locale: this._getLocale(),
            originKey: paymentMethod.initializationData.originKey,
            paymentMethodsResponse: paymentMethod.initializationData.paymentMethodsResponse,
        };

        return this._adyenV2ScriptLoader.load(configuration)
            .then(adyenCheckout => {
                this._adyenCheckout = adyenCheckout;

                const adyenComponent = this._adyenCheckout.create(paymentMethod.method, {
                        ...adyenv2.options,
                        onChange: (state: AdyenCardState) => {
                            this._updateStateContainer(state);
                        },
                    });

                adyenComponent.mount(`#${adyenv2.containerId}`);

                this._adyenComponent = adyenComponent;

                return Promise.resolve(this._store.getState());
            });
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
            .then(() => {
                const paymentPayload = {
                    methodId: payment.methodId,
                    paymentData: {
                        nonce: this._getStateContainer(),
                    },
                };

                return this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
            })
            .catch(error => {
                if (!(error instanceof RequestError) || !some(error.body.errors, { code: 'three_d_secure_required' })) {
                    return Promise.reject(error);
                }

                if (error.body.three_ds_result.result_code === ResultCode.IdentifyShopper) {

                    return this._handle3DS2Fingerprint(error.body.three_ds_result, payment.methodId)
                        .then((payment: Payment) =>
                            this._store.dispatch(this._paymentActionCreator.submitPayment(payment)))
                        .catch(error => {
                            if (error.body.three_ds_result.result_code === ResultCode.ChallengeShopper) {
                                return this._handle3DS2Challenge(error.body.three_ds_result, payment.methodId)
                                    .then((payment: Payment) =>
                                        this._store.dispatch(this._paymentActionCreator.submitPayment(payment)));
                            }

                            return Promise.reject(error);
                        });
                }

                if (error.body.three_ds_result.result_code === ResultCode.ChallengeShopper) {

                    return this._handle3DS2Challenge(error.body.three_ds_result, payment.methodId)
                        .then((payment: Payment) =>
                            this._store.dispatch(this._paymentActionCreator.submitPayment(payment)));
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
        if (this._adyenComponent) {
            this._adyenComponent.unmount();
        }

        return Promise.resolve(this._store.getState());
    }

    private _getAdyenV2PaymentInitializeOptions(): AdyenV2PaymentInitializeOptions {
        if (!this._adyenv2) {
            throw new InvalidArgumentError(' "options.adyen" argument was not provided during initialization.');
        }

        return this._adyenv2;
    }

    private _getLocale(): string {
        const state = this._store.getState();
        const storeConfig = state.config.getStoreConfig();

        if (!storeConfig) {
            return 'en_US';
        }

        return storeConfig.storeProfile.storeLanguage;
    }

    private _getStateContainer(): string {
        if (!this._stateContainer) {
            return '{}';
        }

        return this._stateContainer;
    }

    private _getThreeDS2ChallengeWidgetSize(): ThreeDS2ChallengeWidgetSize {
        const { threeDS2ChallengeWidgetSize } = this._getAdyenV2PaymentInitializeOptions();

        if (!threeDS2ChallengeWidgetSize) {
            return ThreeDS2ChallengeWidgetSize.Medium;
        }

        return threeDS2ChallengeWidgetSize;
    }

    private _handle3DS2Challenge(resultObject: ThreeDS2Result, paymentMethodId: string): Promise<Payment> {

        return new Promise((resolve, reject) => {
            if (!this._adyenCheckout) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            }

            const threeDS2Component = this._adyenCheckout
                .create(ThreeDS2ComponentType.ThreeDS2Challenge, {
                    challengeToken: resultObject.token,
                    onComplete: (challengeData: any) => {
                        const challengePaymentPayload = {
                            ...challengeData.data,
                            paymentData: resultObject.payment_data,
                        };

                        const paymentPayload = {
                            methodId: paymentMethodId,
                            paymentData: {
                                nonce: JSON.stringify(challengePaymentPayload, null, 2),
                            },
                        };

                        resolve(paymentPayload);
                    },
                    onError: (error: AdyenError) => reject(error),
                    size: this._getThreeDS2ChallengeWidgetSize(),
                });

            threeDS2Component.mount(`#${this._getAdyenV2PaymentInitializeOptions().containerId}-3ds`);
        });
    }

    private _handle3DS2Fingerprint(resultObject: ThreeDS2Result, paymentMethodId: string): Promise<Payment> {

        return new Promise((resolve, reject) => {
            if (!this._adyenCheckout) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            }

            const threeDS2Component = this._adyenCheckout
                .create(ThreeDS2ComponentType.ThreeDS2DeviceFingerprint, {
                    fingerprintToken: resultObject.token,
                    onComplete: (fingerprintData: any) => {
                        const fingerprintPaymentPayload = {
                            ...fingerprintData.data,
                            paymentData: resultObject.payment_data,
                        };

                        const paymentPayload = {
                            methodId: paymentMethodId,
                            paymentData: {
                                nonce: JSON.stringify(fingerprintPaymentPayload, null, 2),
                            },
                        };

                        resolve(paymentPayload);
                    },
                    onError: (error: AdyenError) => reject(error),
                });

            threeDS2Component.mount(`#${this._getAdyenV2PaymentInitializeOptions().containerId}-3ds`);
        });
    }

    private _updateStateContainer(newState: AdyenCardState) {
        if (newState.isValid) {
            const state = {
                ...newState.data.paymentMethod,
                origin: window.location.origin,
            };

            this._stateContainer = JSON.stringify(state, null, 2);
        }
    }
}
