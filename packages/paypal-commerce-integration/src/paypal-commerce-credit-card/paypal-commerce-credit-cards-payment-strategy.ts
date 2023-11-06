import { isNil, omitBy } from 'lodash';

import {
    HostedCardFieldOptions,
    HostedCardFieldOptionsMap,
    HostedFieldBlurEventData,
    HostedFieldCardTypeChangeEventData,
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

import PayPalCommerceIntegrationService from '../paypal-commerce-integration-service';
import {
    PayPalCommerceHostedFields,
    PayPalCommerceHostedFieldsRenderOptions,
    PayPalCommerceHostedFieldsState,
    PayPalCommerceHostedFieldsSubmitOptions,
} from '../paypal-commerce-types';

import { WithPayPalCommerceCreditCardsPaymentInitializeOptions } from './paypal-commerce-credit-cards-payment-initialize-options';

export default class PayPalCommerceCreditCardsPaymentStrategy implements PaymentStrategy {
    private executionPaymentData?: OrderPaymentRequestBody['paymentData'];
    private isCreditCardForm?: boolean;
    private hostedFields?: PayPalCommerceHostedFields;
    private hostedFormOptions?: HostedFormOptions;
    private cardNameField?: HTMLInputElement;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalCommerceIntegrationService: PayPalCommerceIntegrationService,
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

        await this.paymentIntegrationService.loadPaymentMethod(methodId);
        await this.paypalCommerceIntegrationService.loadPayPalSdk(methodId, undefined, true, true);

        await this.renderFields(form);
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = payload;
        const { methodId, paymentData } = payment || {};

        if (!payment || !methodId) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        this.executionPaymentData = paymentData;

        let submitPaymentPayload;

        if (paymentData && isVaultedInstrument(paymentData)) {
            submitPaymentPayload = this.preparePaymentPayload(methodId, paymentData);
        } else {
            this.validateHostedFormOrThrow();

            const orderId = await this.submitHostedForm(methodId);

            submitPaymentPayload = this.preparePaymentPayload(methodId, paymentData, orderId);
        }

        await this.paymentIntegrationService.submitOrder(order, options);
        await this.paymentIntegrationService.submitPayment(submitPaymentPayload);
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    /**
     *
     * Submit Payment Payload preparing methods
     *
     */
    private preparePaymentPayload(
        methodId: string,
        paymentData: OrderPaymentRequestBody['paymentData'],
        orderId?: string,
    ): Payment {
        if (paymentData && isVaultedInstrument(paymentData)) {
            return {
                methodId,
                paymentData,
            };
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
                    ...(orderId
                        ? {
                              paypal_account: {
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
     * Hosted fields
     *
     */
    private async renderFields(formOptions: HostedFormOptions): Promise<void> {
        const { fields, styles } = formOptions;

        const paypalSdk = this.paypalCommerceIntegrationService.getPayPalSdkOrThrow();

        const hostedFieldsOptions = {
            fields: this.mapFieldOptions(fields),
            styles: styles ? this.mapStyleOptions(styles) : {},
            paymentsSDK: true,
            createOrder: () =>
                this.paypalCommerceIntegrationService.createOrder(
                    'paypalcommercecreditcardscheckout',
                    this.getInstrumentParams(),
                ),
        };

        if (paypalSdk.HostedFields.isEligible()) {
            this.hostedFields = await paypalSdk.HostedFields.render(hostedFieldsOptions);

            this.setFormFieldEvents(this.hostedFields, formOptions);

            if (isCreditCardFormFields(fields)) {
                this.renderCardNameField(fields.cardName, styles);
            }
        } else {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }
    }

    /**
     *
     * Card Name field methods
     *
     */
    private renderCardNameField(
        field: HostedCardFieldOptions,
        styles?: HostedFieldStylesMap,
    ): void {
        const container = document.getElementById(field.containerId);

        if (!container) {
            throw new InvalidArgumentError(
                'Unable to proceed because "options.paypalcommercecreditcards.form.fields.cardName.containerId" argument is not provided or the item is not defined in the dom.',
            );
        }

        const cardNameFiledStylesPreset = {
            backgroundColor: 'transparent',
            border: 0,
            display: 'block',
            height: '100%',
            margin: 0,
            outline: 'none',
            padding: 0,
            width: '100%',
        };

        const defaultCardNameFiledStyles = {
            ...cardNameFiledStylesPreset,
            ...styles?.default,
        };

        const focusCardNameFiledStyles = {
            ...cardNameFiledStylesPreset,
            ...styles?.focus,
        };

        const defaultStyleProperties = this.getValidStyleString(defaultCardNameFiledStyles);
        const focusStyleProperties = this.getValidStyleString(focusCardNameFiledStyles);

        this.cardNameField = document.createElement('input');

        this.setFieldStyleAttribute(defaultStyleProperties, this.cardNameField);

        this.cardNameField.addEventListener('blur', () =>
            this.setFieldStyleAttribute(defaultStyleProperties, this.cardNameField),
        );
        this.cardNameField.addEventListener('focus', () =>
            this.setFieldStyleAttribute(focusStyleProperties, this.cardNameField),
        );

        container.appendChild(this.cardNameField);
    }

    private setFieldStyleAttribute(style: string, item?: HTMLInputElement): void {
        item?.setAttribute('style', style);
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

    /**
     *
     * Hosted form events
     *
     */
    private setFormFieldEvents(
        hostedFields: PayPalCommerceHostedFields,
        formOptions: HostedFormOptions,
    ): void {
        const eventsData = [
            {
                eventName: 'blur',
                formCallback: formOptions?.onBlur,
                eventHandler: (event: PayPalCommerceHostedFieldsState) =>
                    formOptions?.onBlur?.(this.getFieldTypeByEmittedField(event)),
            },
            {
                eventName: 'focus',
                formCallback: formOptions?.onFocus,
                eventHandler: (event: PayPalCommerceHostedFieldsState) =>
                    formOptions?.onFocus?.(this.getFieldTypeByEmittedField(event)),
            },
            {
                eventName: 'inputSubmitRequest',
                formCallback: formOptions?.onEnter,
                eventHandler: (event: PayPalCommerceHostedFieldsState) =>
                    formOptions?.onEnter?.(this.getFieldTypeByEmittedField(event)),
            },
            {
                eventName: 'cardTypeChange',
                formCallback: formOptions?.onCardTypeChange,
                eventHandler: (event: PayPalCommerceHostedFieldsState) =>
                    formOptions?.onCardTypeChange?.(this.getCardTypeByEvent(event)),
            },
            {
                eventName: 'validityChange',
                formCallback: formOptions?.onValidate,
                eventHandler: (event: PayPalCommerceHostedFieldsState) =>
                    formOptions?.onValidate?.(this.getValidityData(event)),
            },
        ];

        eventsData.forEach(({ eventName, eventHandler, formCallback }) => {
            if (formCallback && typeof formCallback === 'function') {
                hostedFields.on(eventName, eventHandler);
            }
        });
    }

    private getFieldTypeByEmittedField({
        emittedBy,
    }: PayPalCommerceHostedFieldsState):
        | HostedFieldBlurEventData
        | HostedFieldEnterEventData
        | HostedFieldFocusEventData {
        return {
            fieldType: this.mapFieldType(emittedBy),
        };
    }

    private getCardTypeByEvent({
        cards,
    }: PayPalCommerceHostedFieldsState): HostedFieldCardTypeChangeEventData {
        return {
            cardType: cards?.[0]?.type,
        };
    }

    /**
     *
     * Hosted form submit method
     *
     * */
    private async submitHostedForm(methodId: string): Promise<string> {
        const hostedFields = this.getHostedFieldsOrThrow();

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow(methodId);
        const { is3dsEnabled } = paymentMethod.config;

        const options: PayPalCommerceHostedFieldsSubmitOptions = {
            ...(this.cardNameField?.value && {
                cardholderName: this.cardNameField.value,
            }),
            ...(is3dsEnabled && {
                contingencies: ['3D_SECURE'],
            }),
        };

        const { liabilityShift, orderId } = await hostedFields.submit(options);

        if (is3dsEnabled && (liabilityShift === 'NO' || liabilityShift === 'UNKNOWN')) {
            // FIXME: we should throw another error to have an ability to translate it
            throw new PaymentMethodFailedError(
                'Failed authentication. Please try to authorize again.',
            );
        }

        return orderId;
    }

    /**
     *
     * Validation and errors
     *
     */
    private validateHostedFormOrThrow(): void {
        const hostedFields = this.getHostedFieldsOrThrow();
        const hostedFieldState = hostedFields.getState();
        const validationData = this.getValidityData(hostedFieldState);

        if (validationData.isValid) {
            return;
        }

        this.hostedFormOptions?.onValidate?.(validationData);

        throw new PaymentInvalidFormError(this.mapValidationErrors(validationData.errors));
    }

    private getValidityData({
        fields,
    }: PayPalCommerceHostedFieldsState): HostedFieldValidateEventData {
        const fieldsKeys = Object.keys(fields) as Array<
            keyof PayPalCommerceHostedFieldsState['fields']
        >;

        const isValid = fieldsKeys.every((key) => fields[key]?.isValid);
        const errors = fieldsKeys.reduce((fieldsErrors, key) => {
            const fieldType = this.mapFieldType(key);

            return {
                ...fieldsErrors,
                [fieldType]: fields[key]?.isValid
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
            case 'number':
                return this.isCreditCardForm
                    ? HostedFieldType.CardNumber
                    : HostedFieldType.CardNumberVerification;

            case 'expirationDate':
                return HostedFieldType.CardExpiry;

            case 'cvv':
                return this.isCreditCardForm
                    ? HostedFieldType.CardCode
                    : HostedFieldType.CardCodeVerification;

            default:
                throw new Error('Unexpected field type');
        }
    }

    private mapFieldOptions(
        fields: HostedCardFieldOptionsMap | HostedStoredCardFieldOptionsMap,
    ): PayPalCommerceHostedFieldsRenderOptions['fields'] {
        if (isCreditCardFormFields(fields)) {
            const { cardNumber, cardExpiry, cardCode } = fields;

            return {
                ...(cardNumber && {
                    number: {
                        selector: `#${cardNumber.containerId}`,
                        placeholder: cardNumber.placeholder,
                    },
                }),
                ...(cardExpiry && {
                    expirationDate: {
                        selector: `#${cardExpiry.containerId}`,
                        placeholder: cardExpiry.placeholder,
                    },
                }),
                ...(cardCode && {
                    cvv: {
                        selector: `#${cardCode.containerId}`,
                        placeholder: cardCode.placeholder,
                    },
                }),
            };
        }

        const { cardNumberVerification, cardCodeVerification } = fields;

        return {
            ...(cardNumberVerification && {
                number: {
                    selector: `#${cardNumberVerification.containerId}`,
                    placeholder: cardNumberVerification.placeholder,
                },
            }),
            ...(cardCodeVerification && {
                cvv: {
                    selector: `#${cardCodeVerification.containerId}`,
                    placeholder: cardCodeVerification.placeholder,
                },
            }),
        };
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

    private getValidStyleString(styles: HostedInputStyles = {}): string {
        const validStyles = this.mapStyles(styles);

        return Object.keys(validStyles)
            .map((key) => `${key}: ${validStyles[key]}`)
            .join(';');
    }

    /**
     *
     * Utils
     *
     */
    private getHostedFieldsOrThrow(): PayPalCommerceHostedFields {
        if (!this.hostedFields) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this.hostedFields;
    }
}
