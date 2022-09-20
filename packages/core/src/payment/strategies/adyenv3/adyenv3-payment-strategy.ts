import { some } from 'lodash';

import { isHostedInstrumentLike } from '../..';
import { BillingAddress } from '../../../billing';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { getBrowserInfo } from '../../../common/browser-info';
import { InvalidArgumentError, NotInitializedError, NotInitializedErrorType, RequestError } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError, PaymentInvalidFormError, PaymentInvalidFormErrorDetails, PaymentMethodCancelledError } from '../../errors';
import isVaultedInstrument from '../../is-vaulted-instrument';
import Payment from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { isCardState, AdyenAction, AdyenActionType, AdyenAdditionalAction, AdyenAdditionalActionState, AdyenClient, AdyenComponent, AdyenComponentType, AdyenError, AdyenPaymentMethodType, AdyenPlaceholderData, AdyenV3ComponentState, CardStateErrors } from './adyenv3';
import AdyenV3PaymentInitializeOptions from './adyenv3-initialize-options';
import AdyenV3ScriptLoader from './adyenv3-script-loader';

export default class Adyenv3PaymentStrategy implements PaymentStrategy {
    private _adyenClient?: AdyenClient;
    private _cardVerificationComponent?: AdyenComponent;
    private _componentState?: AdyenV3ComponentState;
    private _paymentComponent?: AdyenComponent;
    private _paymentInitializeOptions?: AdyenV3PaymentInitializeOptions;

    constructor(
        private _store: CheckoutStore,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _scriptLoader: AdyenV3ScriptLoader,
        private _locale: string
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {

        const { adyenv3 } = options;

        if (!adyenv3) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.adyenv3" argument is not provided.');
        }

        this._paymentInitializeOptions = adyenv3;

        const paymentMethod = this._store.getState().paymentMethods.getPaymentMethodOrThrow(options.methodId);
        const { initializationData: { environment, clientKey, paymentMethodsResponse } } = paymentMethod;

        this._adyenClient = await this._scriptLoader.load({
            environment,
            locale: this._locale,
            clientKey,
            paymentMethodsResponse,
            showPayButton: false,
        });

        this._paymentComponent = await this._mountPaymentComponent(paymentMethod);

        if (paymentMethod.method === AdyenPaymentMethodType.CreditCard ||
            paymentMethod.method === AdyenPaymentMethodType.Bancontact) {
            this._cardVerificationComponent = await this._mountCardVerificationComponent();
        }

        return Promise.resolve(this._store.getState());
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const paymentData = payment.paymentData;

        const { shouldSaveInstrument, shouldSetAsDefaultInstrument } = isHostedInstrumentLike(paymentData) ? paymentData : { shouldSaveInstrument: false, shouldSetAsDefaultInstrument: false };

        this._validateCardData();

        try {
            await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

            const componentState = this._componentState || { data: { paymentMethod: { type: payment.methodId } } } ;

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

                return await this._store.dispatch(this._paymentActionCreator.submitPayment({
                    ...payment,
                    paymentData: {
                        formattedPayload: {
                            bigpay_token: {
                                ...bigpayToken,
                                token: paymentData.instrumentId,
                            },
                            origin: window.location.origin,
                            browser_info: getBrowserInfo(),
                            set_as_default_stored_instrument: shouldSetAsDefaultInstrument || null,
                        },
                    },
                }));
            }

            return await this._store.dispatch(this._paymentActionCreator.submitPayment({
                methodId: payment.methodId,
                paymentData: {
                    formattedPayload: {
                        credit_card_token: {
                            token: JSON.stringify({
                                ...componentState.data.paymentMethod,
                                type: payment.methodId,
                                origin: window.location.origin,
                            }),
                        },
                        browser_info: getBrowserInfo(),
                        vault_payment_instrument: shouldSaveInstrument || null,
                        set_as_default_stored_instrument: shouldSetAsDefaultInstrument || null,
                    },
                },
            }));
        } catch (error) {
            return this._processAdditionalAction(error, shouldSaveInstrument, shouldSetAsDefaultInstrument);
        }
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._componentState = undefined;

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

    private _updateComponentState(componentState: AdyenV3ComponentState) {
        this._componentState = componentState;
    }

    private _getAdyenClient(): AdyenClient {
        if (!this._adyenClient) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._adyenClient;
    }

    private _getPaymentInitializeOptions(): AdyenV3PaymentInitializeOptions {
        if (!this._paymentInitializeOptions) {
            throw new InvalidArgumentError('"options.adyenv3" argument was not provided during initialization.');
        }

        return this._paymentInitializeOptions;
    }

    private _handleAction(additionalAction: AdyenAdditionalAction): Promise<Payment> {
        return new Promise((resolve, reject) => {
            const { additionalActionOptions } = this._getPaymentInitializeOptions();
            const { onBeforeLoad, containerId, onLoad, onComplete, widgetSize } = additionalActionOptions;
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
                challengeWindowSize: widgetSize || '05',
                onError: (error: AdyenError) => reject(error),
            });

            if (onBeforeLoad) {
                onBeforeLoad(adyenAction.type === AdyenActionType.ThreeDS2 ||
                    adyenAction.type === AdyenActionType.QRCode);
            }

            additionalActionComponent.mount(`#${containerId}`);

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
        const adyenv3 = this._getPaymentInitializeOptions();
        const adyenClient = this._getAdyenClient();
        let cardVerificationComponent: AdyenComponent;

        return new Promise((resolve, reject) => {
            if (adyenv3.cardVerificationContainerId) {
                cardVerificationComponent = adyenClient.create(AdyenComponentType.SecuredFields, {
                    ...adyenv3.options,
                    onChange: componentState => this._updateComponentState(componentState),
                    onError: validateState => adyenv3.validateCardFields(validateState),
                    onFieldValid: validateState => adyenv3.validateCardFields(validateState),
                });

                try {
                    cardVerificationComponent.mount(`#${adyenv3.cardVerificationContainerId}`);
                } catch (error) {
                    reject(new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized));
                }
            }

            resolve(cardVerificationComponent);
        });
    }

    private _mountPaymentComponent(paymentMethod: PaymentMethod): Promise<AdyenComponent> {
        let paymentComponent: AdyenComponent;
        const adyenv3 = this._getPaymentInitializeOptions();
        const adyenClient = this._getAdyenClient();

        return new Promise((resolve, reject) => {
            const billingAddress = this._store.getState().billingAddress.getBillingAddress();

            paymentComponent = adyenClient.create(paymentMethod.method, {
                ...adyenv3.options,
                onChange: componentState => this._updateComponentState(componentState),
                ...(billingAddress ? { data: this._mapAdyenPlaceholderData(billingAddress) } : {}),
            });

            try {
                paymentComponent.mount(`#${adyenv3.containerId}`);
            } catch (error) {
                reject(new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized));
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

    private _validateCardData(): void {
        const adyenv3 = this._getPaymentInitializeOptions();
        const cardComponent = adyenv3.hasVaultedInstruments ? this._cardVerificationComponent : this._paymentComponent;

        if (cardComponent?.props?.type === 'ideal' || !cardComponent?.componentRef?.showValidation || !cardComponent?.state) {
            return;
        }

        cardComponent.componentRef.showValidation();

        if ( Object.keys(cardComponent.state).length === 0 || !cardComponent.state?.isValid ) {
            throw new PaymentInvalidFormError( this._mapCardErrors(cardComponent?.state?.errors) );
        }
    }

    private _mapCardErrors(cardStateErrors: CardStateErrors = {}): PaymentInvalidFormErrorDetails {
        const errors: PaymentInvalidFormErrorDetails = {};

        Object.keys(cardStateErrors).forEach(key => {
            errors[key] = [{
                message: cardStateErrors[key],
                type: key,
            }];
        });

        return errors;
    }
}
