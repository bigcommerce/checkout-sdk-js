import { some } from 'lodash';

import {
    AdyenAction,
    AdyenAdditionalAction,
    AdyenAdditionalActionState,
    AdyenClient,
    AdyenComponent,
    AdyenComponentEventState,
    AdyenComponentType,
    AdyenError,
    AdyenPaymentMethodType,
    AdyenPlaceholderData,
    AdyenV3ActionType,
    AdyenV3PaymentInitializeOptions,
    AdyenV3PaymentMethodInitializationData,
    AdyenV3ScriptLoader,
    CardStateErrors,
    isBoletoState,
    isCardState,
    WithAdyenV3PaymentInitializeOptions,
} from '@bigcommerce/checkout-sdk/adyen-utils';
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

export default class Adyenv3PaymentStrategy implements PaymentStrategy {
    private static readonly mountContainerMaxWaitMs = 5000;
    private static readonly mountContainerPollIntervalMs = 50;

    private adyenClient?: AdyenClient;
    private cardVerificationComponent?: AdyenComponent;
    private componentState?: AdyenComponentEventState;
    private paymentComponent?: AdyenComponent;
    private paymentInitializeOptions?: AdyenV3PaymentInitializeOptions;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private scriptLoader: AdyenV3ScriptLoader,
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

        this.paymentInitializeOptions = adyenv3;

        const paymentMethod = this.paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow<AdyenV3PaymentMethodInitializationData>(options.methodId);
        const { environment, clientKey, paymentMethodsResponse, installmentOptions } =
            paymentMethod.initializationData || {};

        this.adyenClient = await this.scriptLoader.load({
            paymentMethodsConfiguration: {
                klarna: {
                    useKlarnaWidget: true,
                },
                klarna_account: {
                    useKlarnaWidget: true,
                },
                klarna_paynow: {
                    useKlarnaWidget: true,
                },
                ...(installmentOptions
                    ? {
                          card: {
                              installmentOptions: {
                                  showInstallmentAmounts: true,
                                  ...installmentOptions,
                              },
                          },
                      }
                    : {}),
            },
            environment,
            locale: this._getLocale(),
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

        this.paymentComponent = await this._mountPaymentComponent(paymentMethod);

        if (
            paymentMethod.method === AdyenPaymentMethodType.CreditCard ||
            paymentMethod.method === AdyenPaymentMethodType.Bancontact
        ) {
            this.cardVerificationComponent = await this._mountCardVerificationComponent();
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

        if (
            payment.methodId === 'klarna' ||
            payment.methodId === 'klarna_account' ||
            payment.methodId === 'klarna_paynow'
        ) {
            this.paymentComponent?.submit();
        }

        await this.paymentIntegrationService.submitOrder(order, options);

        const componentState = this.componentState || {
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
                await this.paymentIntegrationService.submitPayment({
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
                    paymentData.instrumentId,
                    bigpayToken,
                );

                return;
            }
        }

        let paymentToken = JSON.stringify({
            ...componentState.data.paymentMethod,
            type: payment.methodId,
            origin: window.location.origin,
        });

        if (payment.methodId === 'boletobancario' && isBoletoState(componentState)) {
            paymentToken = JSON.stringify({
                socialSecurityNumber: componentState.data.socialSecurityNumber,
                ...componentState.data.shopperName,
                type: payment.methodId,
                origin: window.location.origin,
            });
        }

        try {
            await this.paymentIntegrationService.submitPayment({
                methodId: payment.methodId,
                paymentData: {
                    formattedPayload: {
                        credit_card_token: {
                            token: paymentToken,
                        },
                        ...(isCardState(componentState) && componentState.data.installments
                            ? {
                                  installments: {
                                      value: componentState.data.installments.value,
                                      plan: componentState.data.installments.plan || 'regular',
                                  },
                              }
                            : {}),
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
        this.componentState = undefined;

        if (this.paymentComponent) {
            this.paymentComponent.unmount();
            this.paymentComponent = undefined;
        }

        if (this.cardVerificationComponent) {
            this.cardVerificationComponent.unmount();
            this.cardVerificationComponent = undefined;
        }

        return Promise.resolve();
    }

    private _updateComponentState(componentState: AdyenComponentEventState) {
        this.componentState = componentState;
    }

    private _getLocale(): string | undefined {
        const locale = this.paymentIntegrationService.getState().getLocale();

        if (locale && locale.substring(0, 2) === 'es') {
            return 'es';
        }

        return locale;
    }

    private _getAdyenClient(): AdyenClient {
        if (!this.adyenClient) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this.adyenClient;
    }

    private _getPaymentInitializeOptions(): AdyenV3PaymentInitializeOptions {
        if (!this.paymentInitializeOptions) {
            throw new InvalidArgumentError(
                '"options.adyenv3" argument was not provided during initialization.',
            );
        }

        return this.paymentInitializeOptions;
    }

    private _handleAction(additionalAction: AdyenAdditionalAction): Promise<Payment> {
        return new Promise((resolve, reject) => {
            const { additionalActionOptions } = this._getPaymentInitializeOptions();
            const { onBeforeLoad, containerId, onLoad, onComplete, widgetSize, onActionHandled } =
                additionalActionOptions;
            const adyenAction: AdyenAction = JSON.parse(additionalAction.action);

            const additionalActionComponent = this._getAdyenClient().createFromAction(adyenAction, {
                onActionHandled: (additionalActionState) => {
                    if (
                        onActionHandled &&
                        typeof onActionHandled === 'function' &&
                        additionalActionState.componentType !== '3DS2Fingerprint'
                    ) {
                        onActionHandled();
                    }
                },
                onAdditionalDetails: (additionalActionState: AdyenAdditionalActionState) => {
                    const paymentPayload = {
                        methodId: adyenAction.paymentMethodType,
                        paymentData: {
                            nonce: JSON.stringify(additionalActionState.data),
                        },
                    };

                    if (onComplete && typeof onComplete === 'function') {
                        onComplete();
                    }

                    resolve(paymentPayload);
                },
                challengeWindowSize: widgetSize || '05',
                onError: (error: AdyenError) => reject(error),
            });

            if (onBeforeLoad && typeof onBeforeLoad === 'function') {
                onBeforeLoad(
                    adyenAction.type === AdyenV3ActionType.ThreeDS2 ||
                        adyenAction.type === AdyenV3ActionType.QRCode ||
                        adyenAction.type === AdyenV3ActionType.Sdk,
                );
            }

            void this._mountElement(additionalActionComponent, containerId)
                .then(() => {
                    if (onLoad && typeof onLoad === 'function') {
                        onLoad(() => {
                            reject(new PaymentMethodCancelledError());
                            additionalActionComponent.unmount();
                        });
                    }
                })
                .catch(reject);
        });
    }

    private _mapAdyenPlaceholderData(
        billingAddress?: BillingAddress,
        prefillCardHolderName?: boolean,
    ): AdyenPlaceholderData {
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
            holderName: prefillCardHolderName ? `${firstName} ${lastName}` : '',
            firstName: prefillCardHolderName ? firstName : '',
            lastName: prefillCardHolderName ? lastName : '',
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

    private async _mountCardVerificationComponent(): Promise<AdyenComponent | undefined> {
        const adyenv3 = this._getPaymentInitializeOptions();
        const adyenClient = this._getAdyenClient();

        if (!adyenv3.cardVerificationContainerId) {
            return undefined;
        }

        const cardVerificationComponent = adyenClient.create(AdyenComponentType.SecuredFields, {
            ...adyenv3.options,
            styles: {
                ...adyenv3.options?.styles,
                placeholder: {
                    color: 'transparent',
                    caretColor: '#000',
                    ...adyenv3.options?.styles?.placeholder,
                },
            },
            onChange: (componentState) => this._updateComponentState(componentState),
            onError: (validateState) => adyenv3.validateCardFields(validateState),
            onFieldValid: (validateState) => adyenv3.validateCardFields(validateState),
        });

        try {
            await this._mountElement(
                cardVerificationComponent,
                adyenv3.cardVerificationContainerId,
            );
        } catch {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return cardVerificationComponent;
    }

    private async _mountPaymentComponent(paymentMethod: PaymentMethod): Promise<AdyenComponent> {
        const adyenv3 = this._getPaymentInitializeOptions();
        const adyenClient = this._getAdyenClient();
        const billingAddress = this.paymentIntegrationService.getState().getBillingAddress();
        const { prefillCardHolderName } = paymentMethod.initializationData;

        const paymentComponent = adyenClient.create(paymentMethod.method, {
            ...adyenv3.options,
            showBrandsUnderCardNumber: false,
            billingAddressRequired: false,
            showEmailAddress: false,
            onChange: (componentState) => this._updateComponentState(componentState),
            onSubmit: (componentState) => this._updateComponentState(componentState),
            ...(billingAddress
                ? { data: this._mapAdyenPlaceholderData(billingAddress, prefillCardHolderName) }
                : {}),
        });

        try {
            await this._mountElement(paymentComponent, adyenv3.containerId);
        } catch {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return paymentComponent;
    }

    private async _processAdditionalAction(
        error: unknown,
        shouldSaveInstrument?: boolean,
        shouldSetAsDefaultInstrument?: boolean,
        paymentToken?: string,
        bigpayToken?: Record<string, unknown>,
    ): Promise<PaymentIntegrationSelectors | void> {
        if (
            !isRequestError(error) ||
            !some(error.body.errors, { code: 'additional_action_required' })
        ) {
            throw error;
        }

        const payment = await this._handleAction(error.body.provider_data);

        try {
            const basePaymentData = {
                ...payment.paymentData,
                shouldSaveInstrument,
                shouldSetAsDefaultInstrument,
            };

            const tokenData =
                shouldSetAsDefaultInstrument && !shouldSaveInstrument
                    ? {
                          instrumentId: paymentToken,
                          formattedPayload: {
                              bigpay_token: {
                                  ...bigpayToken,
                                  token: paymentToken,
                              },
                          },
                      }
                    : {};

            await this.paymentIntegrationService.submitPayment({
                ...payment,
                paymentData: {
                    ...basePaymentData,
                    ...tokenData,
                },
            });
        } catch (paymentError) {
            return this._processAdditionalAction(
                paymentError,
                shouldSaveInstrument,
                shouldSetAsDefaultInstrument,
                paymentToken,
                bigpayToken,
            );
        }
    }

    private _validateCardData(): void {
        const adyenv3 = this._getPaymentInitializeOptions();
        const cardComponent = adyenv3.hasVaultedInstruments
            ? this.cardVerificationComponent
            : this.paymentComponent;

        if (!cardComponent?.componentRef?.showValidation || !cardComponent.state) {
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

    private async _mountElement(
        adyenComponent: AdyenComponent,
        containerId: string,
    ): Promise<void> {
        await this._waitForMountContainer(containerId);

        try {
            adyenComponent.mount(`#${containerId}`);
        } catch {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }
    }

    private async _waitForMountContainer(containerId: string): Promise<void> {
        const maxAttempts = Math.ceil(
            Adyenv3PaymentStrategy.mountContainerMaxWaitMs /
                Adyenv3PaymentStrategy.mountContainerPollIntervalMs,
        );
        const pollIntervalMs = Adyenv3PaymentStrategy.mountContainerPollIntervalMs;

        let step = 0;

        const poll = async (): Promise<void> => {
            if (step === maxAttempts) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            if (document.getElementById(containerId)) {
                return;
            }

            await new Promise<void>((resolve) => {
                setTimeout(resolve, pollIntervalMs);
            });

            step += 1;
            await poll();
        };

        await poll();
    }
}
