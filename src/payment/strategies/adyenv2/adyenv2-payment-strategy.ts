import { some } from 'lodash';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { getBrowserInfo } from '../../../common/browser-info';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType, RequestError } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError, PaymentMethodCancelledError } from '../../errors';
import isVaultedInstrument from '../../is-vaulted-instrument';
import Payment, { HostedInstrument } from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import isCardState, { AdyenAction, AdyenActionType, AdyenAdditionalAction, AdyenAdditionalActionState, AdyenCheckout, AdyenComponent, AdyenComponentState, AdyenComponentType, AdyenConfiguration, AdyenError, AdyenPaymentMethodType } from './adyenv2';
import AdyenV2PaymentInitializeOptions from './adyenv2-initialize-options';
import AdyenV2ScriptLoader from './adyenv2-script-loader';

export default class AdyenV2PaymentStrategy implements PaymentStrategy {
    private _adyenCheckout?: AdyenCheckout;
    private _adyenv2?: AdyenV2PaymentInitializeOptions;
    private _paymentComponent?: AdyenComponent;
    private _cardVerificationComponent?: AdyenComponent;
    private _componentState?: AdyenComponentState;

    constructor(
        private _store: CheckoutStore,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _scriptLoader: AdyenV2ScriptLoader,
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

        this._scriptLoader.load(configuration)
            .then(adyenCheckout => {
                this._adyenCheckout = adyenCheckout;
                this._mountComponent(paymentMethod.method);
            });

        return Promise.resolve(this._store.getState());
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
                const componentState = this._componentState;

                if (!componentState) {
                    throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
                }

                if (paymentData && isVaultedInstrument(paymentData) && isCardState(componentState)) {
                    const { encryptedCardNumber, encryptedSecurityCode, encryptedExpiryMonth, encryptedExpiryYear } = componentState.data.paymentMethod;

                    return this._store.dispatch(this._paymentActionCreator.submitPayment({
                        ...payment,
                        paymentData: {
                            formattedPayload: {
                                bigpay_token: {
                                    token: paymentData.instrumentId,
                                    credit_card_number_confirmation: encryptedCardNumber,
                                    expiry_month: encryptedExpiryMonth,
                                    expiry_year: encryptedExpiryYear,
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
                                    ...componentState.data.paymentMethod,
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
            .catch(error => this._processAdditionalAction(error, shouldSaveInstrument));
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        if (this._paymentComponent) {
            this._paymentComponent.unmount();
            this._paymentComponent = undefined;
        }

        if (this._cardVerificationComponent) {
            this._cardVerificationComponent.unmount();
            this._cardVerificationComponent = undefined;
        }

        return Promise.resolve(this._store.getState());
    }

    private _getAdyenCheckout(): AdyenCheckout {
        if (!this._adyenCheckout) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._adyenCheckout;
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
            return '05';
        }

        return widgetSize;
    }

    private _handleAction(additionalAction: AdyenAdditionalAction): Promise<Payment> {
        return new Promise((resolve, reject) => {
            const { threeDS2ContainerId, additionalActionOptions } = this._getAdyenV2PaymentInitializeOptions();
            const { onBeforeLoad, containerId, onLoad, onComplete } = additionalActionOptions;
            const adyenAction: AdyenAction = JSON.parse(additionalAction.action);

            const additionalActionComponent = this._getAdyenCheckout().createFromAction(adyenAction, {
                onAdditionalDetails: (additionalActionState: AdyenAdditionalActionState) => {
                    const paymentPayload = {
                        methodId: adyenAction.paymentMethodType,
                        paymentData: {
                            nonce: JSON.stringify(additionalActionState.data),
                        },
                    };

                    if (onComplete) {
                        onComplete();
                    }

                    resolve(paymentPayload);
                },
                size: this._getThreeDS2ChallengeWidgetSize(),
                onError: (error: AdyenError) => reject(error),
            });

            if (onBeforeLoad) {
                onBeforeLoad(adyenAction.type === AdyenActionType.ThreeDS2Challenge ||
                    adyenAction.type === AdyenActionType.QRCode);
            }

            additionalActionComponent.mount(`#${containerId || threeDS2ContainerId}`);

            if (onLoad) {
                onLoad(() => {
                    reject(new PaymentMethodCancelledError());
                    additionalActionComponent.unmount();
                });
            }
        });
    }

    private _mountComponent(paymentMethodName: string): void {
        const adyenv2 = this._getAdyenV2PaymentInitializeOptions();
        const adyenCheckout = this._getAdyenCheckout();

        switch (paymentMethodName) {
            case AdyenPaymentMethodType.CreditCard:
            case AdyenPaymentMethodType.ACH:
            case AdyenPaymentMethodType.Bancontact:
            case AdyenPaymentMethodType.GiroPay:
            case AdyenPaymentMethodType.iDEAL:
            case AdyenPaymentMethodType.SEPA:
                const paymentComponent = adyenCheckout.create(paymentMethodName, {
                        ...adyenv2.options,
                        onChange: componentState => this._updateComponentState(componentState),
                    }
                );

                paymentComponent.mount(`#${adyenv2.containerId}`);

                this._paymentComponent = paymentComponent;

                if (adyenv2.cardVerificationContainerId) {
                    const cardVerificationComponent = adyenCheckout.create(AdyenComponentType.SecuredFields, {
                        ...adyenv2.options,
                        onChange: componentState => this._updateComponentState(componentState),
                        onError: componentState => this._updateComponentState(componentState),
                    });

                    cardVerificationComponent.mount(`#${adyenv2.cardVerificationContainerId}`);

                    this._cardVerificationComponent = cardVerificationComponent;
                }
                break;

            case AdyenPaymentMethodType.AliPay:
            case AdyenPaymentMethodType.Sofort:
            case AdyenPaymentMethodType.Vipps:
            case AdyenPaymentMethodType.WeChatPayQR:
                this._updateComponentState({
                    data: {
                        paymentMethod: {
                            type: paymentMethodName,
                        },
                    },
                });
        }
    }

    private async _processAdditionalAction(error: any, shouldSaveInstrument?: boolean): Promise<any> {
        if (!(error instanceof RequestError) || !some(error.body.errors, {code: 'additional_action_required'})) {
            return Promise.reject(error);
        }
        const payment = await this._handleAction(error.body.provider_data);
        try {
            return await this._store.dispatch(this._paymentActionCreator.submitPayment({
                ...payment,
                paymentData: {
                    ...payment.paymentData,
                    shouldSaveInstrument,
                },
            }));
        } catch (error) {
            return this._processAdditionalAction(error, shouldSaveInstrument);
        }
    }

    private _updateComponentState(componentState: AdyenComponentState) {
        this._componentState = componentState;
    }
}
