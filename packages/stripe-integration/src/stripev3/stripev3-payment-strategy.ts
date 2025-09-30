import { includes, isEmpty, omitBy, some } from 'lodash';

import {
    Address,
    BillingAddress,
    Customer,
    HostedForm,
    HostedFormOptions,
    InvalidArgumentError,
    isBillingAddressLike,
    isHostedInstrumentLike,
    isRequestError,
    isVaultedInstrument,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    OrderFinalizationNotRequiredError,
    OrderPaymentRequestBody,
    OrderRequestBody,
    Payment,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodCancelledError,
    PaymentRequestOptions,
    PaymentStrategy,
    StripeV3FormattedPayload,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import isIndividualCardElementOptions from './is-individual-card-element-options';
import {
    PaymentIntent,
    StripeAdditionalAction,
    StripeAddress,
    StripeBillingDetails,
    StripeCardElements,
    StripeConfirmIdealPaymentData,
    StripeConfirmPaymentData,
    StripeConfirmSepaPaymentData,
    StripeElement,
    StripeElementOptions,
    StripeElements,
    StripeElementType,
    StripeError,
    PaymentMethod as StripePaymentMethod,
    StripePaymentMethodType,
    StripeV3Client,
    StripeV3PaymentMethod,
} from './stripev3';
import StripeV3Error, { StripeV3ErrorType } from './stripev3-error';
import StripeV3PaymentInitializeOptions, {
    WithStripeV3PaymentInitializeOptions,
} from './stripev3-initialize-options';
import StripeV3ScriptLoader from './stripev3-script-loader';

const APM_REDIRECT = [StripeElementType.Alipay, StripeElementType.IDEAL];

export default class StripeV3PaymentStrategy implements PaymentStrategy {
    private initializeOptions?: StripeV3PaymentInitializeOptions;
    private stripeV3Client?: StripeV3Client;
    private stripeElements?: StripeElements;
    private stripeElement?: StripeElement;
    private stripeCardElements?: StripeCardElements;
    private useIndividualCardFields?: boolean;
    private hostedForm?: HostedForm;
    private isDeinitialize?: boolean;
    private _allowRedisplayForStoredInstruments?: boolean;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private scriptLoader: StripeV3ScriptLoader,
    ) {}

    async initialize(options: PaymentInitializeOptions & WithStripeV3PaymentInitializeOptions) {
        const { stripev3, methodId, gatewayId } = options;

        if (!gatewayId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "gatewayId" argument is not provided.',
            );
        }

        this.initializeOptions = stripev3;
        this.isDeinitialize = false;

        const paymentMethod = this.paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow(methodId);

        const {
            initializationData: {
                stripePublishableKey,
                stripeConnectedAccount,
                useIndividualCardFields,
                allowRedisplayForStoredInstruments,
            },
        } = paymentMethod as StripeV3PaymentMethod;

        this._allowRedisplayForStoredInstruments = allowRedisplayForStoredInstruments;

        const form = this.getInitializeOptions().form;

        this.useIndividualCardFields = useIndividualCardFields;
        this.stripeV3Client = await this.loadStripeJs(stripePublishableKey, stripeConnectedAccount);

        if (
            this.isCreditCard(methodId) &&
            this.shouldShowTSVHostedForm(methodId, gatewayId) &&
            form
        ) {
            this.hostedForm = await this.mountCardVerificationFields(form);
        } else {
            this.stripeElement = await this.mountCardFields(methodId);
        }
    }

    async execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = orderRequest;

        let formattedPayload: StripeV3FormattedPayload;
        let stripeError: StripeError | undefined;

        if (!payment || !payment.paymentData) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        const { paymentData, gatewayId, methodId } = payment;

        const { shouldSaveInstrument, shouldSetAsDefaultInstrument } = isHostedInstrumentLike(
            paymentData,
        )
            ? paymentData
            : { shouldSaveInstrument: false, shouldSetAsDefaultInstrument: false };

        const shouldSubmitOrderBeforeLoadingAPM = includes(APM_REDIRECT, methodId);

        const { isStoreCreditApplied: useStoreCredit } = this.paymentIntegrationService
            .getState()
            .getCheckoutOrThrow();

        if (useStoreCredit) {
            await this.paymentIntegrationService.applyStoreCredit(useStoreCredit);
        }

        try {
            if (shouldSubmitOrderBeforeLoadingAPM) {
                await this.paymentIntegrationService.submitOrder(order, options);
            }

            if (gatewayId) {
                await this.paymentIntegrationService.loadPaymentMethod(gatewayId, {
                    params: { method: methodId },
                });
            }

            const state = this.paymentIntegrationService.getState();

            if (isVaultedInstrument(paymentData)) {
                await this.paymentIntegrationService.submitOrder(order, options);

                const { instrumentId } = paymentData;
                const paymentMethod = state.getPaymentMethodOrThrow(payment.methodId);
                const clientToken = paymentMethod.clientToken;

                if (!clientToken) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                return await this.executeWithVaulted(
                    payment,
                    instrumentId,
                    shouldSetAsDefaultInstrument,
                    clientToken,
                );
            }

            const paymentMethod = state.getPaymentMethodOrThrow(methodId);
            const result = await this.confirmStripePayment(paymentMethod);
            const { clientToken, method } = paymentMethod;
            const { id: token } = result.paymentIntent ?? result.paymentMethod ?? { id: '' };

            stripeError = result.error;

            formattedPayload = {
                credit_card_token: { token },
                vault_payment_instrument: shouldSaveInstrument,
                confirm: false,
                set_as_default_stored_instrument: shouldSetAsDefaultInstrument,
            };

            if (method === StripeElementType.CreditCard) {
                formattedPayload.client_token = clientToken;
            }

            if (!shouldSubmitOrderBeforeLoadingAPM) {
                await this.paymentIntegrationService.submitOrder(order, options);
            }

            const paymentPayload = this.buildPaymentPayload(
                methodId,
                formattedPayload,
                shouldSetAsDefaultInstrument,
            );

            await this.paymentIntegrationService.submitPayment(paymentPayload);
        } catch (error) {
            await this.processAdditionalAction(
                this.handleEmptyPaymentIntentError(error, stripeError),
                methodId,
                shouldSaveInstrument,
                shouldSetAsDefaultInstrument,
            );
        }
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        if (this.hostedForm) {
            this.hostedForm.detach();
        }

        this.isDeinitialize = true;
        this.unmountElement();

        return Promise.resolve();
    }

    private buildPaymentPayload(
        methodId: string,
        formattedPayload: StripeV3FormattedPayload,
        shouldSetAsDefaultInstrument: boolean | undefined,
    ): Payment {
        const paymentData = shouldSetAsDefaultInstrument
            ? {
                  formattedPayload: {
                      ...formattedPayload,
                      set_as_default_stored_instrument: shouldSetAsDefaultInstrument,
                  },
              }
            : { formattedPayload };

        return { methodId, paymentData };
    }

    private isCancellationError(stripeError: StripeError | undefined) {
        return (
            stripeError &&
            stripeError.payment_intent.last_payment_error?.message?.indexOf('canceled') !== -1
        );
    }

    private isAuthError(stripeError: StripeError | undefined) {
        return stripeError?.code === 'payment_intent_authentication_failure';
    }

    private isCreditCard(methodId: string): boolean {
        return methodId === StripePaymentMethodType.CreditCard;
    }

    private isHostedFieldAvailable(): boolean {
        const options = this.getInitializeOptions();
        const definedFields = omitBy(options.form?.fields, isEmpty);

        return !isEmpty(definedFields);
    }

    private isHostedPaymentFormEnabled(methodId: string, gatewayId?: string): boolean {
        const { getPaymentMethodOrThrow } = this.paymentIntegrationService.getState();
        const paymentMethod = getPaymentMethodOrThrow(methodId, gatewayId);

        return Boolean(paymentMethod.config.isHostedFormEnabled);
    }

    private async confirmStripePayment(paymentMethod: PaymentMethod): Promise<{
        paymentIntent?: PaymentIntent | undefined;
        paymentMethod?: StripePaymentMethod | undefined;
        error?: StripeError | undefined;
    }> {
        const { clientToken: clientSecret, method, returnUrl } = paymentMethod;

        if (!clientSecret) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        switch (method) {
            case StripeElementType.Alipay:
                return this.getStripeJs().confirmAlipayPayment(
                    clientSecret,
                    { return_url: returnUrl },
                    { handleActions: false },
                );

            case StripeElementType.IDEAL: {
                const data = this.mapStripePaymentData(StripePaymentMethodType.IDEAL, returnUrl);

                return this.getStripeJs().confirmIdealPayment(clientSecret, data, {
                    handleActions: false,
                });
            }

            case StripeElementType.Sepa: {
                const data = this.mapStripePaymentData(StripePaymentMethodType.Sepa);

                return this.getStripeJs().confirmSepaDebitPayment(clientSecret, data);
            }

            default: {
                const card = this.useIndividualCardFields
                    ? this.getStripeCardElements()[0]
                    : this.getStripeElement();
                const billingDetails = this.mapStripeBillingDetails(
                    this.paymentIntegrationService.getState().getBillingAddress(),
                    this.paymentIntegrationService.getState().getCustomer(),
                );
                const shouldAllowRedisplay = this._allowRedisplayForStoredInstruments;

                return this.getStripeJs().createPaymentMethod({
                    type: StripePaymentMethodType.CreditCard,
                    card,
                    billing_details: billingDetails,
                    ...(shouldAllowRedisplay ? { allow_redisplay: 'always' } : {}),
                });
            }
        }
    }

    private async executeWithVaulted(
        payment: OrderPaymentRequestBody,
        token: string,
        shouldSetAsDefaultInstrument: boolean | undefined,
        clientToken: string,
    ): Promise<any> {
        const formattedPayload = {
            bigpay_token: { token },
            confirm: true,
            client_token: clientToken,
            set_as_default_stored_instrument: shouldSetAsDefaultInstrument,
        };

        if (
            this.isHostedPaymentFormEnabled(payment.methodId, payment.gatewayId) &&
            this.hostedForm
        ) {
            const form = this.hostedForm;

            if (payment.paymentData && isVaultedInstrument(payment.paymentData)) {
                payment.paymentData = {
                    ...payment.paymentData,
                    instrumentId: JSON.stringify({
                        token: payment.paymentData?.instrumentId || '',
                        client_token: clientToken,
                    }),
                };
            }

            await form.validate();
            await form.submit(payment);

            return this.paymentIntegrationService.loadCurrentOrder();
        }

        const paymentPayload = this.buildPaymentPayload(
            payment.methodId,
            formattedPayload,
            shouldSetAsDefaultInstrument,
        );

        return this.paymentIntegrationService.submitPayment(paymentPayload);
    }

    private getInitializeOptions(): StripeV3PaymentInitializeOptions {
        if (!this.initializeOptions) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this.initializeOptions;
    }

    private getStripeCardElements(): StripeCardElements {
        if (!this.stripeCardElements) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this.stripeCardElements;
    }

    private getStripeElement(): StripeElement {
        if (!this.stripeElement) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this.stripeElement;
    }

    private getStripeJs(): StripeV3Client {
        if (!this.stripeV3Client) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this.stripeV3Client;
    }

    private handleEmptyPaymentIntentError(error: unknown, stripeError: StripeError | undefined) {
        if (!isRequestError(error)) {
            return error;
        }

        return some(error.body.errors, { code: 'required_field' }) && stripeError
            ? new Error(stripeError.message)
            : error;
    }

    private async loadStripeJs(
        stripePublishableKey: string,
        stripeConnectedAccount: string,
    ): Promise<StripeV3Client> {
        if (this.stripeV3Client) {
            return Promise.resolve(this.stripeV3Client);
        }

        return this.scriptLoader.load(
            stripePublishableKey,
            stripeConnectedAccount,
            this.paymentIntegrationService.getState().getLocale(),
        );
    }

    private mapStripeAddress(address?: Address): StripeAddress {
        if (address) {
            const {
                city,
                countryCode: country,
                address1: line1,
                address2: line2,
                postalCode,
                stateOrProvinceCode: state,
            } = address;

            return { city, country, line1, line2, postal_code: postalCode, state };
        }

        return { line1: '' };
    }

    private mapStripeBillingDetails(
        billingAddress?: BillingAddress,
        customer?: Customer,
    ): StripeBillingDetails {
        const { firstName, lastName } = billingAddress ||
            customer || { firstName: 'Guest', lastName: '' };
        const name = `${firstName} ${lastName}`.trim();
        const { options } = this.getInitializeOptions();

        if (this.useIndividualCardFields && isIndividualCardElementOptions(options)) {
            const { zipCodeElementOptions } = options;

            if (zipCodeElementOptions) {
                const postalCode = document.getElementById(zipCodeElementOptions.containerId)
                    ? (
                          document.getElementById(
                              zipCodeElementOptions.containerId,
                          ) as HTMLInputElement
                      ).value
                    : '';

                if (postalCode && billingAddress) {
                    billingAddress = { ...billingAddress, postalCode };
                }
            }
        }

        const address = {
            address: this.mapStripeAddress(billingAddress),
        };

        if (customer && customer.addresses[0] && isBillingAddressLike(customer.addresses[0])) {
            const customerAddress = customer.addresses[0];
            const { email } = customer;
            const { phone } = customerAddress;

            return phone ? { ...address, email, name, phone } : { ...address, email, name };
        }

        if (billingAddress) {
            const { email, phone } = billingAddress;

            return phone ? { ...address, email, name, phone } : { ...address, email, name };
        }

        return { ...address, name };
    }

    private mapStripePaymentData(
        stripePaymentMethodType: StripePaymentMethodType.IDEAL,
        returnUrl?: string,
    ): StripeConfirmIdealPaymentData;
    private mapStripePaymentData(
        stripePaymentMethodType: StripePaymentMethodType.Sepa,
    ): StripeConfirmSepaPaymentData;
    private mapStripePaymentData(
        stripePaymentMethodType: StripePaymentMethodType,
        returnUrl?: string,
    ): StripeConfirmPaymentData {
        const customer = this.paymentIntegrationService.getState().getCustomer();
        const billingAddress = this.paymentIntegrationService.getState().getBillingAddress();

        const result: Partial<StripeConfirmPaymentData> = {
            payment_method: {
                [stripePaymentMethodType]: this.getStripeElement(),
                billing_details: this.mapStripeBillingDetails(billingAddress, customer),
            },
        };

        if (stripePaymentMethodType === StripePaymentMethodType.IDEAL) {
            return { ...result, return_url: returnUrl };
        }

        return result;
    }

    private mountCardFields(methodId: string): Promise<StripeElement> {
        const { options, containerId } = this.getInitializeOptions();

        let stripeElement: StripeElement;

        return new Promise((resolve, reject) => {
            if (!this.stripeElements) {
                this.stripeElements = this.getStripeJs().elements();
            }

            switch (methodId) {
                case StripeElementType.CreditCard:
                    if (this.useIndividualCardFields && isIndividualCardElementOptions(options)) {
                        const {
                            cardNumberElementOptions,
                            cardExpiryElementOptions,
                            cardCvcElementOptions,
                        } = options;

                        const cardNumberElement =
                            this.stripeElements.getElement(StripeElementType.CardNumber) ||
                            this.stripeElements.create(
                                StripeElementType.CardNumber,
                                cardNumberElementOptions,
                            );
                        const cardExpiryElement =
                            this.stripeElements.getElement(StripeElementType.CardExpiry) ||
                            this.stripeElements.create(
                                StripeElementType.CardExpiry,
                                cardExpiryElementOptions,
                            );
                        const cardCvcElement =
                            this.stripeElements.getElement(StripeElementType.CardCvc) ||
                            this.stripeElements.create(
                                StripeElementType.CardCvc,
                                cardCvcElementOptions,
                            );

                        this.stripeCardElements = [
                            cardNumberElement,
                            cardExpiryElement,
                            cardCvcElement,
                        ];
                        stripeElement = this.stripeCardElements[0];

                        try {
                            cardNumberElement.mount(`#${cardNumberElementOptions.containerId}`);
                            cardExpiryElement.mount(`#${cardExpiryElementOptions.containerId}`);
                            cardCvcElement.mount(`#${cardCvcElementOptions.containerId}`);
                        } catch (error) {
                            if (!this.isDeinitialize) {
                                reject(
                                    new InvalidArgumentError(
                                        'Unable to mount Stripe component without valid container ID.',
                                    ),
                                );
                            }
                        }
                    } else {
                        stripeElement =
                            this.stripeElements.getElement(methodId) ||
                            this.stripeElements.create(methodId, options as StripeElementOptions);

                        try {
                            stripeElement.mount(`#${containerId}`);
                        } catch (error) {
                            if (!this.isDeinitialize) {
                                reject(
                                    new InvalidArgumentError(
                                        'Unable to mount Stripe component without valid container ID.',
                                    ),
                                );
                            }
                        }
                    }

                    break;

                case StripeElementType.IDEAL:
                case StripeElementType.Sepa:
                    stripeElement =
                        this.stripeElements.getElement(methodId) ||
                        this.stripeElements.create(methodId, options as StripeElementOptions);

                    try {
                        stripeElement.mount(`#${containerId}`);
                    } catch (error) {
                        if (!this.isDeinitialize) {
                            reject(
                                new InvalidArgumentError(
                                    'Unable to mount Stripe component without valid container ID.',
                                ),
                            );
                        }
                    }

                    break;

                case StripeElementType.Alipay:
                    break;
            }

            resolve(stripeElement);
        });
    }

    private async mountCardVerificationFields(formOptions: HostedFormOptions): Promise<HostedForm> {
        const state = this.paymentIntegrationService.getState();
        const storeConfig = state.getStoreConfig();

        if (!storeConfig) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        const bigpayBaseUrl = storeConfig.paymentSettings.bigpayBaseUrl;

        const form = this.paymentIntegrationService.createHostedForm(bigpayBaseUrl, formOptions);

        await form.attach();

        return form;
    }

    private async processAdditionalAction(
        error: unknown,
        methodId: string,
        shouldSaveInstrument = false,
        shouldSetAsDefaultInstrument = false,
    ): Promise<any | never> {
        if (!isRequestError(error)) {
            throw error;
        }

        const isAdditionalActionError = some(error.body.errors, {
            code: 'additional_action_required',
        });
        const isThreeDSecureRequiredError = some(error.body.errors, {
            code: 'three_d_secure_required',
        });

        if (isAdditionalActionError) {
            const action: StripeAdditionalAction = error.body.additional_action_required;

            if (action && action.type === 'redirect_to_url') {
                return new Promise(() => {
                    if (action.data.redirect_url) {
                        window.location.replace(action.data.redirect_url);
                    }
                });
            }
        }

        if (isThreeDSecureRequiredError) {
            const clientSecret = error.body.three_ds_result.token;
            const needsConfirm = false;
            let catchedConfirmError = false;
            let result;

            try {
                result = await this.getStripeJs().confirmCardPayment(clientSecret);
            } catch (error) {
                catchedConfirmError = true;
            }

            if (result?.error) {
                if (this.isCancellationError(result.error)) {
                    throw new PaymentMethodCancelledError();
                }

                if (this.isAuthError(result.error)) {
                    throw new StripeV3Error(StripeV3ErrorType.AuthFailure);
                }

                throw new Error(result.error.message);
            }

            const token = this.getPaymentToken(
                result?.paymentIntent,
                clientSecret,
                catchedConfirmError,
            );

            const formattedPayload = {
                credit_card_token: { token },
                vault_payment_instrument: shouldSaveInstrument,
                confirm: needsConfirm,
            };

            const paymentPayload = this.buildPaymentPayload(
                methodId,
                formattedPayload,
                shouldSetAsDefaultInstrument,
            );

            try {
                return await this.paymentIntegrationService.submitPayment(paymentPayload);
            } catch (error) {
                throw this.handleEmptyPaymentIntentError(error, result?.error);
            }
        }

        throw error;
    }

    private getPaymentToken(
        paymentIntent: PaymentIntent | undefined,
        clientSecret: string,
        catchedConfirmError: boolean,
    ): string {
        if (!paymentIntent || catchedConfirmError) {
            return clientSecret;
        }

        return paymentIntent.id;
    }

    private shouldShowTSVHostedForm(methodId: string, gatewayId: string): boolean {
        return (
            this.isHostedFieldAvailable() && this.isHostedPaymentFormEnabled(methodId, gatewayId)
        );
    }

    private unmountElement(): void {
        if (this.stripeElement) {
            this.stripeElement.unmount();
            this.stripeElement = undefined;
        }
    }
}
