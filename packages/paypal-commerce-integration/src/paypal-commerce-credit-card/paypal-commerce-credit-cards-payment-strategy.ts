import { isNil, omitBy } from 'lodash';

import {
    HostedCardFieldOptions,
    HostedCardFieldOptionsMap,
    HostedFieldBlurEventData,
    HostedFieldEnterEventData,
    HostedFieldFocusEventData,
    HostedFieldStylesMap,
    HostedFieldType,
    HostedFieldValidateEventData,
    HostedFormOptions,
    HostedInputStyles,
    HostedInputValidateErrorData,
    HostedInputValidateErrorDataMap,
    HostedInstrument,
    HostedStoredCardFieldOptionsMap,
    InvalidArgumentError,
    isCreditCardFormFields,
    isCreditCardVaultedFormFields,
    isHostedInstrumentLike,
    isVaultedInstrument,
    NotInitializedError,
    NotInitializedErrorType,
    objectWithKebabCaseKeys,
    OrderFinalizationNotRequiredError,
    OrderPaymentRequestBody,
    OrderRequestBody,
    Payment,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentInvalidFormError,
    PaymentInvalidFormErrorDetails,
    PaymentMethodFailedError,
    PaymentRequestOptions,
    PaymentStrategy,
    VaultedInstrument,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    isPayPalCommerceAcceleratedCheckoutCustomer,
    PayPalCommerceAcceleratedCheckoutUtils,
    PayPalCommerceInitializationData,
    PayPalCommerceSdk,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import PayPalCommerceIntegrationService from '../paypal-commerce-integration-service';
import {
    PayPalCommerceCardFields,
    PayPalCommerceCardFieldsConfig,
    PayPalCommerceCardFieldsOnApproveData,
    PayPalCommerceCardFieldsState,
    PayPalCommerceFields,
    PayPalCommerceHostedFieldsRenderOptions,
} from '../paypal-commerce-types';

import { WithPayPalCommerceCreditCardsPaymentInitializeOptions } from './paypal-commerce-credit-cards-payment-initialize-options';

export default class PayPalCommerceCreditCardsPaymentStrategy implements PaymentStrategy {
    private executionPaymentData?: OrderPaymentRequestBody['paymentData'];
    private isCreditCardForm?: boolean;
    private isCreditCardVaultedForm?: boolean;

    private cardFields?: PayPalCommerceCardFields;
    private cvvField?: PayPalCommerceFields;
    private expiryField?: PayPalCommerceFields;
    private numberField?: PayPalCommerceFields;
    private nameField?: PayPalCommerceFields;

    private hostedFormOptions?: HostedFormOptions;
    private returnedOrderId?: string;
    private returnedVaultedToken?: string;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalCommerceIntegrationService: PayPalCommerceIntegrationService,
        private paypalCommerceSdk: PayPalCommerceSdk,
        private paypalCommerceAcceleratedCheckoutUtils: PayPalCommerceAcceleratedCheckoutUtils,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithPayPalCommerceCreditCardsPaymentInitializeOptions,
    ): Promise<void> {
        const { methodId, paypalcommercecreditcards, paypalcommerce } = options;
        const form = paypalcommercecreditcards?.form || paypalcommerce?.form;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!form) {
            throw new InvalidArgumentError(
                'Unable to proceed because "options.paypalcommercecreditcards.form" argument is not provided.',
            );
        }

        this.hostedFormOptions = form;

        this.isCreditCardForm = isCreditCardFormFields(form.fields);
        this.isCreditCardVaultedForm =
            isCreditCardVaultedFormFields(form.fields) && !this.hasUndefinedValues();

        await this.paymentIntegrationService.loadPaymentMethod(methodId);
        await this.paypalCommerceIntegrationService.loadPayPalSdk(methodId, undefined, true, true);

        if (this.isCreditCardForm || this.isCreditCardVaultedForm) {
            await this.initializeFields(form);
        }

        if (this.shouldInitializePayPalConnect(methodId)) {
            await this.initializePayPalConnectOrThrow(methodId);
        }
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = payload;
        const { methodId, paymentData } = payment || {};

        if (!payment || !methodId) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        this.executionPaymentData = paymentData;

        if (this.isCreditCardForm || this.isCreditCardVaultedForm) {
            await this.validateHostedFormOrThrow();
            await this.submitHostedForm();
        }

        // This condition is triggered when we pay with vaulted instrument and shipping address is trusted
        if (!this.returnedOrderId) {
            const { orderId } = await this.paypalCommerceIntegrationService.createOrderCardFields(
                'paypalcommercecreditcardscheckout',
                this.getInstrumentParams(),
            );

            this.returnedOrderId = orderId;
        }

        const submitPaymentPayload = this.preparePaymentPayload(
            methodId,
            paymentData,
            this.returnedOrderId,
            this.returnedVaultedToken,
        );

        await this.paymentIntegrationService.submitOrder(order, options);
        await this.paymentIntegrationService.submitPayment(submitPaymentPayload);
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async deinitialize(): Promise<void> {
        await this.cvvField?.close();
        await this.expiryField?.close();
        await this.numberField?.close();
        await this.nameField?.close();

        return Promise.resolve();
    }

    /**
     *
     * Submit Payment Payload preparing method
     *
     * `vaultedToken` is used when we pay with vaulted instrument (with trusted shipping address and untrusted)
     * `setupToken` is used when we pay with vaulted instrument (untrusted shipping address)
     * `orderId` is used in every case (basic card payment, trusted shipping address and untrusted)
     */
    private preparePaymentPayload(
        methodId: string,
        paymentData: OrderPaymentRequestBody['paymentData'],
        orderId?: string,
        setupToken?: string,
    ): Payment {
        let vaultedToken: string | undefined;

        if (paymentData && isVaultedInstrument(paymentData)) {
            const { instrumentId } = paymentData;

            vaultedToken = instrumentId;
        }

        const { shouldSaveInstrument = false, shouldSetAsDefaultInstrument = false } =
            isHostedInstrumentLike(paymentData) ? paymentData : {};

        return {
            methodId,
            paymentData: {
                formattedPayload: {
                    vault_payment_instrument: shouldSaveInstrument || false,
                    set_as_default_stored_instrument: shouldSetAsDefaultInstrument || false,
                    device_info: null,
                    method_id: methodId,
                    ...(vaultedToken
                        ? {
                              bigpay_token: { token: vaultedToken },
                          }
                        : {}),
                    ...(setupToken
                        ? {
                              setup_token: setupToken,
                          }
                        : {}),
                    ...(orderId
                        ? {
                              card_with_order: {
                                  order_id: orderId,
                              },
                          }
                        : {}),
                },
            },
        };
    }

    /**
     *
     * Card fields initialize
     *
     */
    private async initializeFields(formOptions: HostedFormOptions): Promise<void> {
        const { fields, styles } = formOptions;

        const paypalSdk = this.paypalCommerceIntegrationService.getPayPalSdkOrThrow();
        const executeCallback = this.getExecuteCallback(fields);

        const cardFieldsConfig: PayPalCommerceCardFieldsConfig = {
            style: this.getInputStyles(styles),
            onApprove: ({ orderID, vaultSetupToken }: PayPalCommerceCardFieldsOnApproveData) =>
                this.handleApprove({ orderID, vaultSetupToken }),
            onError: () => {
                throw new PaymentMethodFailedError();
            },
            inputEvents: {
                onChange: (event) => this.onChangeHandler(formOptions, event),
                onFocus: (event) => this.onFocusHandler(formOptions, event),
                onBlur: (event) => this.onBlurHandler(formOptions, event),
                onInputSubmitRequest: (event) => this.onInputSubmitRequest(formOptions, event),
            },
            ...executeCallback,
        };

        this.cardFields = await paypalSdk.CardFields(cardFieldsConfig);

        if (this.cardFields.isEligible()) {
            this.stylizeInputContainers(fields);

            if (isCreditCardFormFields(fields)) {
                this.renderFields(fields);
            }

            if (isCreditCardVaultedFormFields(fields)) {
                this.renderVaultedFields(fields);
            }
        } else {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }
    }

    /**
     *
     * Get execute callback method
     * Depends on shipping address is trusted or not we should pass to PP
     * `createVaultSetupToken` callback if address is untrusted or
     * `createOrder` if address is trusted
     *
     */
    private getExecuteCallback(
        fields: HostedCardFieldOptionsMap | HostedStoredCardFieldOptionsMap,
    ) {
        const isVaultedForm = isCreditCardVaultedFormFields(fields);

        return isVaultedForm ? this.createVaultSetupTokenCallback() : this.createOrderCallback();
    }

    private createVaultSetupTokenCallback() {
        return {
            createVaultSetupToken: async () => {
                const { setupToken } =
                    (await this.paypalCommerceIntegrationService.createOrderCardFields(
                        'paypalcommercecreditcardscheckout',
                        {
                            ...this.getInstrumentParams(),
                            setupToken: true,
                        },
                    )) || {};

                return setupToken;
            },
        };
    }

    private createOrderCallback() {
        return {
            createOrder: async () => {
                const { orderId } =
                    (await this.paypalCommerceIntegrationService.createOrderCardFields(
                        'paypalcommercecreditcardscheckout',
                        this.getInstrumentParams(),
                    )) || {};

                return orderId;
            },
        };
    }

    /**
     *
     * onApprove method
     * When submitting a form with a `submitHostedForm` method if there is no error
     * then onApprove callback is triggered and depends on the flow
     * we will receive an `orderID` if it's basic paying and `vaultSetupToken` if we are paying
     * with vaulted instrument and shipping address is untrusted
     *
     */
    private handleApprove({ orderID, vaultSetupToken }: PayPalCommerceCardFieldsOnApproveData) {
        if (orderID) {
            this.returnedOrderId = orderID;
        }

        if (vaultSetupToken) {
            this.returnedVaultedToken = vaultSetupToken;
        }
    }

    /**
     *
     * Rendering Card Fields methods
     *
     */
    private renderFields(fieldsOptions: HostedCardFieldOptionsMap) {
        const cardFields = this.getCardFieldsOrThrow();

        if (fieldsOptions.cardCode?.containerId) {
            this.cvvField = cardFields.CVVField({
                placeholder: '',
            });
            this.cvvField.render(`#${fieldsOptions.cardCode.containerId}`);
        }

        if (fieldsOptions.cardExpiry?.containerId) {
            this.expiryField = cardFields.ExpiryField();
            this.expiryField.render(`#${fieldsOptions.cardExpiry.containerId}`);
        }

        if (fieldsOptions.cardName?.containerId) {
            this.nameField = cardFields.NameField({
                placeholder: '',
            });
            this.nameField.render(`#${fieldsOptions.cardName.containerId}`);
        }

        if (fieldsOptions.cardNumber?.containerId) {
            this.numberField = cardFields.NumberField({
                placeholder: '',
            });
            this.numberField.render(`#${fieldsOptions.cardNumber.containerId}`);
        }
    }

    private renderVaultedFields(fieldsOptions: HostedStoredCardFieldOptionsMap) {
        const cardFields = this.getCardFieldsOrThrow();

        if (fieldsOptions.cardCodeVerification?.containerId) {
            this.cvvField = cardFields.CVVField({
                placeholder: '',
            });
            this.cvvField.render(`#${fieldsOptions.cardCodeVerification.containerId}`);
        }

        if (fieldsOptions.cardExpiryVerification?.containerId) {
            this.expiryField = cardFields.ExpiryField();
            this.expiryField.render(`#${fieldsOptions.cardExpiryVerification.containerId}`);
        }

        if (fieldsOptions.cardNumberVerification?.containerId) {
            this.numberField = cardFields.NumberField({
                placeholder: '',
            });
            this.numberField.render(`#${fieldsOptions.cardNumberVerification.containerId}`);
        }
    }

    /**
     *
     * Instrument params method
     *
     */
    private getInstrumentParams(): HostedInstrument | VaultedInstrument {
        if (!this.executionPaymentData) {
            return {};
        }

        if (isHostedInstrumentLike(this.executionPaymentData)) {
            const { shouldSaveInstrument, shouldSetAsDefaultInstrument } =
                this.executionPaymentData;

            return {
                shouldSaveInstrument,
                shouldSetAsDefaultInstrument,
            };
        }

        if (isVaultedInstrument(this.executionPaymentData)) {
            const { instrumentId } = this.executionPaymentData;

            return {
                instrumentId,
            };
        }

        return {};
    }

    private getFieldTypeByEmittedField({
        emittedBy,
    }: PayPalCommerceCardFieldsState):
        | HostedFieldBlurEventData
        | HostedFieldEnterEventData
        | HostedFieldFocusEventData {
        return {
            fieldType: this.mapFieldType(emittedBy),
        };
    }

    /**
     *
     * Form submit method
     * Triggers a form submit
     * */
    private async submitHostedForm() {
        const cardFields = this.getCardFieldsOrThrow();

        await cardFields.submit().catch(() => {
            throw new PaymentMethodFailedError(
                'Failed authentication. Please try to authorize again.',
            );
        });
    }

    /**
     *
     * Validation and errors
     *
     */
    private async validateHostedFormOrThrow() {
        const cardFields = this.getCardFieldsOrThrow();
        const cardFieldsState = await cardFields.getState().then((data) => data);
        const validationData = this.getValidityData(cardFieldsState);

        if (validationData.isValid) {
            return;
        }

        this.hostedFormOptions?.onValidate?.(validationData);

        throw new PaymentInvalidFormError(this.mapValidationErrors(validationData.errors));
    }

    private getValidityData({
        fields,
    }: PayPalCommerceCardFieldsState): HostedFieldValidateEventData {
        const updatedFields = { ...fields };

        delete updatedFields.cardNameField;

        const fieldsKeys = Object.keys(updatedFields) as Array<
            keyof PayPalCommerceCardFieldsState['fields']
        >;

        const isValid = fieldsKeys.every((key) => updatedFields[key]?.isValid);

        const errors = fieldsKeys.reduce((fieldsErrors, key) => {
            const fieldType = this.mapFieldType(key);

            return {
                ...fieldsErrors,
                [fieldType]: updatedFields[key]?.isValid
                    ? undefined
                    : [this.getInvalidErrorByFieldType(fieldType)],
            };
        }, {});

        return { isValid, errors };
    }

    private getInvalidErrorByFieldType(fieldType: string): HostedInputValidateErrorData {
        switch (fieldType) {
            case HostedFieldType.CardCode:
            case HostedFieldType.CardCodeVerification:
                return {
                    fieldType,
                    message: 'Invalid card code',
                    type: 'invalid_card_code',
                };

            case HostedFieldType.CardNumber:
            case HostedFieldType.CardNumberVerification:
                return {
                    fieldType,
                    message: 'Invalid card number',
                    type: 'invalid_card_number',
                };

            case HostedFieldType.CardExpiry:
            case HostedFieldType.CardExpiryVerification:
                return {
                    fieldType,
                    message: 'Invalid card expiry',
                    type: 'invalid_card_expiry',
                };

            default:
                return {
                    fieldType,
                    message: 'Invalid field',
                    type: 'invalid',
                };
        }
    }

    private mapValidationErrors(
        validationErrors: HostedInputValidateErrorDataMap = {},
    ): PaymentInvalidFormErrorDetails {
        const errors: PaymentInvalidFormErrorDetails = {};
        const validationErrorsKeys = Object.keys(validationErrors) as Array<
            keyof HostedInputValidateErrorDataMap
        >;

        validationErrorsKeys.forEach((key) => {
            errors[key] = [
                {
                    message: validationErrors[key]?.[0]?.message || '',
                    type: key,
                },
            ];
        });

        return errors;
    }

    /**
     *
     * Fields mappers
     *
     */
    private mapFieldType(type: string): HostedFieldType {
        switch (type) {
            case 'name':
                return HostedFieldType.CardName;

            case 'cardNumberField':
            case 'number':
                return this.isCreditCardForm
                    ? HostedFieldType.CardNumber
                    : HostedFieldType.CardNumberVerification;

            case 'cardExpiryField':
            case 'expiry':
                return this.isCreditCardForm
                    ? HostedFieldType.CardExpiry
                    : HostedFieldType.CardExpiryVerification;

            case 'cardCvvField':
            case 'cvv':
                return this.isCreditCardForm
                    ? HostedFieldType.CardCode
                    : HostedFieldType.CardCodeVerification;

            default:
                throw new Error('Unexpected field type');
        }
    }

    /**
     *
     * Styles mappers
     *
     */
    private mapStyleOptions(
        styles: HostedFieldStylesMap,
    ): PayPalCommerceHostedFieldsRenderOptions['styles'] {
        return {
            input: this.mapStyles(styles.default),
            '.invalid': this.mapStyles(styles.error),
            ':focus': this.mapStyles(styles.focus),
        };
    }

    private mapStyles(styles: HostedInputStyles = {}): { [key: string]: string } {
        return omitBy(objectWithKebabCaseKeys(styles), isNil);
    }

    /**
     *
     * Utils
     *
     */
    private getCardFieldsOrThrow(): PayPalCommerceCardFields {
        if (!this.cardFields) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this.cardFields;
    }

    private getInputStyles(
        styles?: HostedFieldStylesMap,
    ): PayPalCommerceHostedFieldsRenderOptions['styles'] {
        const defaultStyles = {
            input: {
                'font-size': '1rem',
                'font-family': 'Montserrat, Arial, Helvetica, sans-serif',
                color: '#5f5f5f',
                outline: 'none',
                padding: '9px 13px',
            },
        };
        const mappedStyles = styles ? this.mapStyleOptions(styles) : null;

        return mappedStyles
            ? {
                  ...mappedStyles,
                  input: {
                      ...mappedStyles.input,
                      outline: 'none',
                      padding: '9px 13px',
                  },
              }
            : defaultStyles;
    }

    private stylizeInputContainers(
        fields: HostedCardFieldOptionsMap | HostedStoredCardFieldOptionsMap,
    ): void {
        Object.values(fields || {}).forEach((id: HostedCardFieldOptions) => {
            const element = document.getElementById(`${id?.containerId || ''}`);

            if (element) {
                element.style.padding = '0px';
                element.style.boxShadow = 'none';
                element.style.border = 'none';
                element.style.background = 'transparent';
                element.style.marginBottom = '10px';
                element.style.marginLeft = '-5px';
            }
        });
    }

    private hasUndefinedValues() {
        if (this.hostedFormOptions) {
            return Object.values(this.hostedFormOptions.fields).some(
                (value) => value === undefined,
            );
        }

        return true;
    }

    /**
     *
     * Input events methods
     *
     */

    private onChangeHandler(
        formOptions: HostedFormOptions,
        event: PayPalCommerceCardFieldsState,
    ): void {
        formOptions?.onValidate?.(this.getValidityData(event));
    }

    private onFocusHandler(
        formOptions: HostedFormOptions,
        event: PayPalCommerceCardFieldsState,
    ): void {
        formOptions?.onFocus?.(this.getFieldTypeByEmittedField(event));
    }

    private onBlurHandler(
        formOptions: HostedFormOptions,
        event: PayPalCommerceCardFieldsState,
    ): void {
        formOptions?.onBlur?.(this.getFieldTypeByEmittedField(event));
    }

    private onInputSubmitRequest(
        formOptions: HostedFormOptions,
        event: PayPalCommerceCardFieldsState,
    ): void {
        formOptions?.onEnter?.(this.getFieldTypeByEmittedField(event));
    }

    /**
     *
     * PayPal Commerce Accelerated checkout related methods
     *
     */
    // TODO: remove this part when PPCP AXO A/B testing will be finished
    private shouldInitializePayPalConnect(methodId: string) {
        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(methodId);
        const paymentProviderCustomer = state.getPaymentProviderCustomer();
        const paypalCommercePaymentProviderCustomer = isPayPalCommerceAcceleratedCheckoutCustomer(
            paymentProviderCustomer,
        )
            ? paymentProviderCustomer
            : {};

        return (
            paymentMethod?.initializationData?.isAcceleratedCheckoutEnabled &&
            paymentMethod?.initializationData?.isPayPalCommerceAnalyticsV2Enabled &&
            !paypalCommercePaymentProviderCustomer?.authenticationState
        );
    }

    // TODO: remove this part when PPCP AXO A/B testing will be finished
    private async initializePayPalConnectOrThrow(methodId: string): Promise<void> {
        try {
            const state = this.paymentIntegrationService.getState();
            const cart = state.getCartOrThrow();
            const paymentMethod =
                state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(methodId);
            const { initializationData } = paymentMethod;

            if (!initializationData?.connectClientToken) {
                return;
            }

            const paypalAxoSdk = await this.paypalCommerceSdk.getPayPalAxo(
                paymentMethod,
                cart.currency.code,
                cart.id,
            );

            await this.paypalCommerceAcceleratedCheckoutUtils.initializePayPalConnect(
                paypalAxoSdk,
                !!initializationData?.isDeveloperModeApplicable,
            );
        } catch (_: unknown) {
            // We should avoid throwing any error from this flow to do no brake default flow
            // This flow is optional
        }
    }
}
