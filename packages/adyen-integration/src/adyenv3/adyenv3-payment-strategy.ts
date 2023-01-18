import { some } from 'lodash';

import {
    BillingAddress,
    getBrowserInfo,
    InvalidArgumentError,
    isHostedInstrumentLike,
    isRequestError,
    isVaultedInstrument,
    NotInitializedError,
    NotInitializedErrorType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    Payment,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationSelectors,
    PaymentIntegrationService,
    PaymentInvalidFormError,
    PaymentInvalidFormErrorDetails,
    PaymentMethod,
    PaymentMethodCancelledError,
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    AdyenAction,
    AdyenActionType,
    AdyenAdditionalAction,
    AdyenAdditionalActionState,
    AdyenClient,
    AdyenComponent,
    AdyenComponentType,
    AdyenError,
    AdyenPaymentMethodType,
    AdyenPlaceholderData,
    AdyenV3ComponentState,
    CardStateErrors,
    isCardState,
} from './adyenv3';
import AdyenV3PaymentInitializeOptions, {
    WithAdyenV3PaymentInitializeOptions,
} from './adyenv3-initialize-options';
import AdyenV3ScriptLoader from './adyenv3-script-loader';

export default class Adyenv3PaymentStrategy implements PaymentStrategy {
    private _adyenClient?: AdyenClient;
    private _cardVerificationComponent?: AdyenComponent;
    private _componentState?: AdyenV3ComponentState;
    private _paymentComponent?: AdyenComponent;
    private _paymentInitializeOptions?: AdyenV3PaymentInitializeOptions;

    constructor(
        private _paymentIntegrationService: PaymentIntegrationService,
        private _scriptLoader: AdyenV3ScriptLoader,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithAdyenV3PaymentInitializeOptions,
    ): Promise<void> {
        const { adyenv3 } = options;

        if (!adyenv3) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.adyenv3" argument is not provided.',
            );
        }

        this._paymentInitializeOptions = adyenv3;

        const paymentMethod = this._paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow(options.methodId);
        const {
            initializationData: { environment, clientKey, paymentMethodsResponse },
        } = paymentMethod;

        this._adyenClient = await this._scriptLoader.load({
            environment,
            locale: this._paymentIntegrationService.getState().getLocale(),
            clientKey,
            paymentMethodsResponse,
            showPayButton: false,
            translations: {
                es: { 'creditCard.expiryDateField.title': 'Fecha de caducidad' },
                'es-AR': { 'creditCard.expiryDateField.title': 'Fecha de caducidad' },
                'es-ES': { 'creditCard.expiryDateField.title': 'Fecha de caducidad' },
                'es-MX': { 'creditCard.expiryDateField.title': 'Fecha de caducidad' },
                'es-CL': { 'creditCard.expiryDateField.title': 'Fecha de caducidad' },
                'es-CO': { 'creditCard.expiryDateField.title': 'Fecha de caducidad' },
                'es-PE': { 'creditCard.expiryDateField.title': 'Fecha de caducidad' },
            },
        });

        this._paymentComponent = await this._mountPaymentComponent(paymentMethod);

        if (
            paymentMethod.method === AdyenPaymentMethodType.CreditCard ||
            paymentMethod.method === AdyenPaymentMethodType.Bancontact
        ) {
            this._cardVerificationComponent = await this._mountCardVerificationComponent();
        }

        return Promise.resolve();
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const paymentData = payment.paymentData;

        const { shouldSaveInstrument, shouldSetAsDefaultInstrument } = isHostedInstrumentLike(
            paymentData,
        )
            ? paymentData
            : { shouldSaveInstrument: false, shouldSetAsDefaultInstrument: false };

        this._validateCardData();

        await this._paymentIntegrationService.submitOrder(order, options);

        const componentState = this._componentState || {
            data: { paymentMethod: { type: payment.methodId } },
        };

        if (paymentData && isVaultedInstrument(paymentData)) {
            let bigpayToken = {};

            if (isCardState(componentState)) {
                const {
                    encryptedCardNumber,
                    encryptedSecurityCode,
                    encryptedExpiryMonth,
                    encryptedExpiryYear,
                } = componentState.data.paymentMethod;

                bigpayToken = {
                    credit_card_number_confirmation: encryptedCardNumber,
                    expiry_month: encryptedExpiryMonth,
                    expiry_year: encryptedExpiryYear,
                    verification_value: encryptedSecurityCode,
                };
            }

            try {
                await this._paymentIntegrationService.submitPayment({
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
                });

                return;
            } catch (error) {
                await this._processAdditionalAction(
                    error,
                    shouldSaveInstrument,
                    shouldSetAsDefaultInstrument,
                );

                return;
            }
        }

        try {
            await this._paymentIntegrationService.submitPayment({
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
            });
        } catch (error) {
            await this._processAdditionalAction(
                error,
                shouldSaveInstrument,
                shouldSetAsDefaultInstrument,
            );
        }
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        this._componentState = undefined;

        if (this._paymentComponent) {
            this._paymentComponent.unmount();
            this._paymentComponent = undefined;
        }

        if (this._cardVerificationComponent) {
            this._cardVerificationComponent.unmount();
            this._cardVerificationComponent = undefined;
        }

        return Promise.resolve();
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
            throw new InvalidArgumentError(
                '"options.adyenv3" argument was not provided during initialization.',
            );
        }

        return this._paymentInitializeOptions;
    }

    private _handleAction(additionalAction: AdyenAdditionalAction): Promise<Payment> {
        return new Promise((resolve, reject) => {
            const { additionalActionOptions } = this._getPaymentInitializeOptions();
            const { onBeforeLoad, containerId, onLoad, onComplete, widgetSize } =
                additionalActionOptions;
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
                onBeforeLoad(
                    adyenAction.type === AdyenActionType.ThreeDS2 ||
                        adyenAction.type === AdyenActionType.QRCode,
                );
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
                    onChange: (componentState) => this._updateComponentState(componentState),
                    onError: (validateState) => adyenv3.validateCardFields(validateState),
                    onFieldValid: (validateState) => adyenv3.validateCardFields(validateState),
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
            const billingAddress = this._paymentIntegrationService.getState().getBillingAddress();

            paymentComponent = adyenClient.create(paymentMethod.method, {
                ...adyenv3.options,
                showBrandsUnderCardNumber: false,
                onChange: (componentState) => this._updateComponentState(componentState),
                ...(billingAddress ? { data: this._mapAdyenPlaceholderData(billingAddress) } : {}),
            });
            console.log(123);
            try {
                paymentComponent.mount(`#${adyenv3.containerId}`);
            } catch (error) {
                reject(new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized));
            }

            resolve(paymentComponent);
        });
    }

    private async _processAdditionalAction(
        error: unknown,
        shouldSaveInstrument?: boolean,
        shouldSetAsDefaultInstrument?: boolean,
    ): Promise<PaymentIntegrationSelectors | void> {
        if (
            !isRequestError(error) ||
            !some(error.body.errors, { code: 'additional_action_required' })
        ) {
            throw error;
        }

        const payment = await this._handleAction(error.body.provider_data);

        try {
            await this._paymentIntegrationService.submitPayment({
                ...payment,
                paymentData: {
                    ...payment.paymentData,
                    shouldSaveInstrument,
                    shouldSetAsDefaultInstrument,
                },
            });
        } catch (paymentError) {
            return this._processAdditionalAction(
                paymentError,
                shouldSaveInstrument,
                shouldSetAsDefaultInstrument,
            );
        }
    }

    private _validateCardData(): void {
        const adyenv3 = this._getPaymentInitializeOptions();
        const cardComponent = adyenv3.hasVaultedInstruments
            ? this._cardVerificationComponent
            : this._paymentComponent;

        if (
            cardComponent?.props?.type === 'ideal' ||
            !cardComponent?.componentRef?.showValidation ||
            !cardComponent.state
        ) {
            return;
        }

        cardComponent.componentRef.showValidation();

        if (Object.keys(cardComponent.state).length === 0 || !cardComponent.state.isValid) {
            throw new PaymentInvalidFormError(this._mapCardErrors(cardComponent.state.errors));
        }
    }

    private _mapCardErrors(cardStateErrors: CardStateErrors = {}): PaymentInvalidFormErrorDetails {
        const errors: PaymentInvalidFormErrorDetails = {};

        Object.keys(cardStateErrors).forEach((key) => {
            errors[key] = [
                {
                    message: cardStateErrors[key],
                    type: key,
                },
            ];
        });

        return errors;
    }
}
