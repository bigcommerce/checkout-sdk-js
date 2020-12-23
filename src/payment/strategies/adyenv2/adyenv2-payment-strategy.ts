import { some } from 'lodash';

import { BillingAddress } from '../../../billing';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { getBrowserInfo } from '../../../common/browser-info';
import { InvalidArgumentError, NotInitializedError, NotInitializedErrorType, RequestError } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError, PaymentMethodCancelledError } from '../../errors';
import isVaultedInstrument from '../../is-vaulted-instrument';
import Payment, { HostedInstrument } from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { isAccountState, isCardState, AdyenAction, AdyenActionType, AdyenAdditionalAction, AdyenAdditionalActionState, AdyenClient, AdyenComponent, AdyenComponentState, AdyenComponentType, AdyenError, AdyenPaymentMethodType, AdyenPlaceholderData } from './adyenv2';
import AdyenV2PaymentInitializeOptions from './adyenv2-initialize-options';
import AdyenV2ScriptLoader from './adyenv2-script-loader';

export default class AdyenV2PaymentStrategy implements PaymentStrategy {
    private _adyenClient?: AdyenClient;
    private _cardVerificationComponent?: AdyenComponent;
    private _componentState?: AdyenComponentState;
    private _paymentComponent?: AdyenComponent;
    private _paymentInitializeOptions?: AdyenV2PaymentInitializeOptions;

    constructor(
        private _store: CheckoutStore,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _scriptLoader: AdyenV2ScriptLoader
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { adyenv2 } = options;

        if (!adyenv2) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.adyenv2" argument is not provided.');
        }

        this._paymentInitializeOptions = adyenv2;

        const paymentMethod = this._store.getState().paymentMethods.getPaymentMethodOrThrow(options.methodId);
        const clientSideAuthentication = {
            key: '',
            value: '',
        };

        if (paymentMethod.initializationData.originKey) {
            clientSideAuthentication.key = 'originKey';
            clientSideAuthentication.value = paymentMethod.initializationData.originKey;
        } else {
            clientSideAuthentication.key = 'clientKey';
            clientSideAuthentication.value = paymentMethod.initializationData.clientKey;
        }

        this._adyenClient = await this._scriptLoader.load({
            environment:  paymentMethod.initializationData.environment,
            locale: navigator.language,
            [clientSideAuthentication.key]: clientSideAuthentication.value,
            paymentMethodsResponse: paymentMethod.initializationData.paymentMethodsResponse,
        });

        this._paymentComponent = await this._mountPaymentComponent(paymentMethod);

        if (paymentMethod.method === AdyenPaymentMethodType.CreditCard ||
            paymentMethod.method === AdyenPaymentMethodType.Bancontact) {
            this._cardVerificationComponent = await this._mountCardVerificationComponent();
        }

        return Promise.resolve(this._store.getState());
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;
        const paymentData = payment && payment.paymentData;
        const shouldSaveInstrument = paymentData && (paymentData as HostedInstrument).shouldSaveInstrument;
        const shouldSetAsDefaultInstrument = paymentData && (paymentData as HostedInstrument).shouldSetAsDefaultInstrument;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
            .then(() => {
                const componentState = this._componentState;

                if (!componentState) {
                    throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
                }

                if (paymentData && isVaultedInstrument(paymentData)) {
                    let bigpayToken = {};
                    if (isCardState(componentState)) {
                        const { encryptedCardNumber, encryptedSecurityCode, encryptedExpiryMonth, encryptedExpiryYear } = componentState.data.paymentMethod;

                        bigpayToken = {
                            credit_card_number_confirmation: encryptedCardNumber,
                            expiry_month: encryptedExpiryMonth,
                            expiry_year: encryptedExpiryYear,
                            verification_value: encryptedSecurityCode,
                        };
                    }

                    if (isCardState(componentState) || isAccountState(componentState)) {
                        return this._store.dispatch(this._paymentActionCreator.submitPayment({
                            ...payment,
                            paymentData: {
                                formattedPayload: {
                                    bigpay_token: {
                                        ...bigpayToken,
                                        token: paymentData.instrumentId,
                                    },
                                    browser_info: getBrowserInfo(),
                                    set_as_default_stored_instrument: shouldSetAsDefaultInstrument || null,
                                },
                            },
                        }));
                    }
                }

                return this._store.dispatch(this._paymentActionCreator.submitPayment({
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
                            vault_payment_instrument: shouldSaveInstrument || null,
                            set_as_default_stored_instrument: shouldSetAsDefaultInstrument || null,
                        },
                    },
                }));
            })
            .catch(error => this._processAdditionalAction(error, shouldSaveInstrument, shouldSetAsDefaultInstrument));
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

    private _getAdyenClient(): AdyenClient {
        if (!this._adyenClient) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._adyenClient;
    }

    private _getPaymentInitializeOptions(): AdyenV2PaymentInitializeOptions {
        if (!this._paymentInitializeOptions) {
            throw new InvalidArgumentError('"options.adyenv2" argument was not provided during initialization.');
        }

        return this._paymentInitializeOptions;
    }

    private _getThreeDS2ChallengeWidgetSize(): string {
        const { widgetSize } = this._getPaymentInitializeOptions().threeDS2Options;

        if (!widgetSize) {
            return '05';
        }

        return widgetSize;
    }

    private _handleAction(additionalAction: AdyenAdditionalAction): Promise<Payment> {
        return new Promise((resolve, reject) => {
            const { threeDS2ContainerId, additionalActionOptions } = this._getPaymentInitializeOptions();
            const { onBeforeLoad, containerId, onLoad, onComplete } = additionalActionOptions;
            const adyenAction: AdyenAction = JSON.parse(additionalAction.action);

            const additionalActionComponent = this._getAdyenClient().createFromAction(adyenAction, {
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

    private _mapAdyenPlaceholderData(billingAddress?: BillingAddress): AdyenPlaceholderData {
        if (!billingAddress) {
            return {};
        }

        const {
            firstName,
            lastName,
            address1: street,
            address2: houseNumberOrName,
            postalCode,
            city,
            stateOrProvinceCode: stateOrProvince,
            countryCode: country,
        } = billingAddress;

        return {
            holderName: `${firstName} ${lastName}`,
            billingAddress: {
                street,
                houseNumberOrName,
                postalCode,
                city,
                stateOrProvince,
                country,
            },
        };
    }

    private _mountCardVerificationComponent(): Promise<AdyenComponent> {
        const adyenv2 = this._getPaymentInitializeOptions();
        const adyenClient = this._getAdyenClient();
        let cardVerificationComponent: AdyenComponent;

        return new Promise((resolve, reject) => {
            if (adyenv2.cardVerificationContainerId) {
                cardVerificationComponent = adyenClient.create(AdyenComponentType.SecuredFields, {
                    ...adyenv2.options,
                    onChange: componentState => this._updateComponentState(componentState),
                    onError: componentState => this._updateComponentState(componentState),
                });

                try {
                    cardVerificationComponent.mount(`#${adyenv2.cardVerificationContainerId}`);
                } catch (error) {
                    reject(new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized));
                }
            }

            resolve(cardVerificationComponent);
        });
    }

    private _mountPaymentComponent(paymentMethod: PaymentMethod): Promise<AdyenComponent> {
        let paymentComponent: AdyenComponent;
        const adyenv2 = this._getPaymentInitializeOptions();
        const adyenClient = this._getAdyenClient();

        return new Promise((resolve, reject) => {
            switch (paymentMethod.method) {
                case AdyenPaymentMethodType.CreditCard:
                case AdyenPaymentMethodType.ACH:
                case AdyenPaymentMethodType.Bancontact:
                    const billingAddress = this._store.getState().billingAddress.getBillingAddress();

                    paymentComponent = adyenClient.create(paymentMethod.method, {
                        ...adyenv2.options,
                        onChange: componentState => this._updateComponentState(componentState),
                        data: this._mapAdyenPlaceholderData(billingAddress),
                    });

                    try {
                        paymentComponent.mount(`#${adyenv2.containerId}`);
                    } catch (error) {
                        reject(new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized));
                    }

                    break;

                case AdyenPaymentMethodType.iDEAL:
                case AdyenPaymentMethodType.SEPA:
                    if (!adyenv2.hasVaultedInstruments) {
                        paymentComponent = adyenClient.create(paymentMethod.method, {
                            ...adyenv2.options,
                            onChange: componentState => this._updateComponentState(componentState),
                        });

                        try {
                            paymentComponent.mount(`#${adyenv2.containerId}`);
                        } catch (error) {
                            reject(new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized));
                        }

                    } else {
                        this._updateComponentState({
                            data: {
                                paymentMethod: {
                                    type: paymentMethod.method,
                                },
                            },
                        });
                    }
                    break;

                case AdyenPaymentMethodType.AliPay:
                case AdyenPaymentMethodType.GiroPay:
                case AdyenPaymentMethodType.Sofort:
                case AdyenPaymentMethodType.Klarna:
                case AdyenPaymentMethodType.KlarnaPayNow:
                case AdyenPaymentMethodType.KlarnaAccount:
                case AdyenPaymentMethodType.Vipps:
                case AdyenPaymentMethodType.WeChatPayQR:
                    this._updateComponentState({
                        data: {
                            paymentMethod: {
                                type: paymentMethod.method,
                            },
                        },
                    });
            }

            resolve(paymentComponent);
        });
    }

    private async _processAdditionalAction(error: unknown, shouldSaveInstrument?: boolean, shouldSetAsDefaultInstrument?: boolean): Promise<InternalCheckoutSelectors> {
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
                    shouldSetAsDefaultInstrument,
                },
            }));
        } catch (error) {
            return this._processAdditionalAction(error, shouldSaveInstrument, shouldSetAsDefaultInstrument);
        }
    }

    private _updateComponentState(componentState: AdyenComponentState) {
        this._componentState = componentState;
    }
}
