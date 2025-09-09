import { Dictionary, isEmpty, isNil, omitBy } from 'lodash';

import {
    BraintreeBillingAddressRequestData,
    BraintreeClient,
    BraintreeFormErrorDataKeys,
    BraintreeFormErrorsData,
    BraintreeFormFieldsMap,
    BraintreeFormFieldStyles,
    BraintreeFormFieldStylesMap,
    BraintreeFormFieldType,
    BraintreeFormFieldValidateErrorData,
    BraintreeFormFieldValidateEventData,
    BraintreeFormOptions,
    BraintreeHostedFields,
    BraintreeHostedFieldsCreatorConfig,
    BraintreeHostedFieldsState,
    BraintreeHostedFormError,
    BraintreeScriptLoader,
    BraintreeStoredCardFieldsMap,
    isBraintreeFormFieldsMap,
    isBraintreeHostedFormError,
    isBraintreeSupportedCardBrand,
    TokenizationPayload,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    Address,
    NotInitializedError,
    NotInitializedErrorType,
    PaymentInvalidFormError,
    PaymentInvalidFormErrorDetails,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

enum BraintreeHostedFormType {
    CreditCard,
    StoredCardVerification,
}

export default class BraintreeHostedForm {
    private cardFields?: BraintreeHostedFields;
    private formOptions?: BraintreeFormOptions;
    private type?: BraintreeHostedFormType;
    private client?: Promise<BraintreeClient>;
    private clientToken?: string;
    private isInitializedHostedForm = false;

    constructor(private braintreeScriptLoader: BraintreeScriptLoader) {}

    async initialize(
        options: BraintreeFormOptions,
        unsupportedCardBrands?: string[],
        clientToken?: string,
    ): Promise<void> {
        this.clientToken = clientToken;
        this.formOptions = options;
        this.type = isBraintreeFormFieldsMap(options.fields)
            ? BraintreeHostedFormType.CreditCard
            : BraintreeHostedFormType.StoredCardVerification;

        const fields = this.mapFieldOptions(options.fields, unsupportedCardBrands);

        if (isEmpty(fields)) {
            this.isInitializedHostedForm = false;

            return;
        }

        this.cardFields = await this.createHostedFields({
            fields,
            styles: options.styles && this.mapStyleOptions(options.styles),
        });

        this.cardFields?.on('blur', this.handleBlur);
        this.cardFields?.on('focus', this.handleFocus);
        this.cardFields?.on('cardTypeChange', this.handleCardTypeChange);
        this.cardFields?.on('validityChange', this.handleValidityChange);
        this.cardFields?.on('inputSubmitRequest', this.handleInputSubmitRequest);

        this.isInitializedHostedForm = true;
    }

    isInitialized(): boolean {
        return !!this.isInitializedHostedForm;
    }

    async deinitialize(): Promise<void> {
        if (this.isInitializedHostedForm) {
            this.isInitializedHostedForm = false;
            await this.cardFields?.teardown();
        }
    }

    validate(): void {
        if (!this.cardFields) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const state = this.cardFields.getState();

        if (!this.isValidForm(state)) {
            this.handleValidityChange(state);

            const errors = this.mapValidationErrors(state.fields);

            throw new PaymentInvalidFormError(errors as PaymentInvalidFormErrorDetails);
        }
    }

    async tokenize(billingAddress: Address): Promise<TokenizationPayload> {
        if (!this.cardFields) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        try {
            const payload = await this.cardFields.tokenize(
                omitBy(
                    {
                        billingAddress: billingAddress && this.mapBillingAddress(billingAddress),
                    },
                    isNil,
                ),
            );

            this.formOptions?.onValidate?.({ isValid: true, errors: {} });

            return {
                nonce: payload.nonce,
                bin: payload.details?.bin,
            };
        } catch (error) {
            if (isBraintreeHostedFormError(error)) {
                const errors = this.mapTokenizeError(error);

                if (errors) {
                    this.formOptions?.onValidate?.({ isValid: false, errors });
                    throw new PaymentInvalidFormError(errors as PaymentInvalidFormErrorDetails);
                }
            }

            throw error;
        }
    }

    async tokenizeForStoredCardVerification(): Promise<TokenizationPayload> {
        if (!this.cardFields) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        try {
            const payload = await this.cardFields.tokenize();

            this.formOptions?.onValidate?.({ isValid: true, errors: {} });

            return {
                nonce: payload.nonce,
                bin: payload.details?.bin,
            };
        } catch (error) {
            if (isBraintreeHostedFormError(error)) {
                const errors = this.mapTokenizeError(error, true);

                if (errors) {
                    this.formOptions?.onValidate?.({ isValid: false, errors });
                    throw new PaymentInvalidFormError(errors as PaymentInvalidFormErrorDetails);
                }
            }

            throw error;
        }
    }

    async createHostedFields(
        options: Pick<BraintreeHostedFieldsCreatorConfig, 'fields' | 'styles'>,
    ): Promise<BraintreeHostedFields> {
        const client = await this.getClient();
        const hostedFields = await this.braintreeScriptLoader.loadHostedFields();

        return hostedFields.create({ ...options, client });
    }

    async getClient(): Promise<BraintreeClient> {
        if (!this.clientToken) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        if (!this.client) {
            const client = await this.braintreeScriptLoader.loadClient();

            this.client = client.create({ authorization: this.clientToken });
        }
        console.log('JJJ');

        return this.client;
    }

    private mapBillingAddress(billingAddress: Address): BraintreeBillingAddressRequestData {
        return {
            countryName: billingAddress.country,
            postalCode: billingAddress.postalCode,
            streetAddress: billingAddress.address2
                ? `${billingAddress.address1} ${billingAddress.address2}`
                : billingAddress.address1,
        };
    }

    private mapFieldOptions(
        fields: BraintreeFormFieldsMap | BraintreeStoredCardFieldsMap,
        unsupportedCardBrands?: string[],
    ): BraintreeHostedFieldsCreatorConfig['fields'] {
        if (isBraintreeFormFieldsMap(fields)) {
            const supportedCardBrands: Partial<Record<string, boolean>> = {};

            unsupportedCardBrands?.forEach((cardBrand) => {
                if (isBraintreeSupportedCardBrand(cardBrand)) {
                    supportedCardBrands[cardBrand] = false;
                }
            });

            return omitBy(
                {
                    number: {
                        container: `#${fields.cardNumber.containerId}`,
                        placeholder: fields.cardNumber.placeholder,
                        internalLabel: fields.cardNumber.accessibilityLabel,
                        ...(Object.keys(supportedCardBrands).length > 0
                            ? { supportedCardBrands }
                            : {}),
                    },
                    expirationDate: {
                        container: `#${fields.cardExpiry.containerId}`,
                        placeholder: fields.cardExpiry.placeholder,
                        internalLabel: fields.cardExpiry.accessibilityLabel,
                    },
                    cvv: fields.cardCode && {
                        container: `#${fields.cardCode.containerId}`,
                        placeholder: fields.cardCode.placeholder,
                        internalLabel: fields.cardCode.accessibilityLabel,
                    },
                    cardholderName: {
                        container: `#${fields.cardName.containerId}`,
                        placeholder: fields.cardName.placeholder,
                        internalLabel: fields.cardName.accessibilityLabel,
                    },
                },
                isNil,
            );
        }

        return omitBy(
            {
                number: fields.cardNumberVerification && {
                    container: `#${fields.cardNumberVerification.containerId}`,
                    placeholder: fields.cardNumberVerification.placeholder,
                },
                cvv: fields.cardCodeVerification && {
                    container: `#${fields.cardCodeVerification.containerId}`,
                    placeholder: fields.cardCodeVerification.placeholder,
                },
            },
            isNil,
        );
    }

    private mapStyleOptions(
        options: BraintreeFormFieldStylesMap,
    ): BraintreeHostedFieldsCreatorConfig['styles'] {
        const mapStyles = (styles: BraintreeFormFieldStyles = {}) =>
            omitBy(
                {
                    color: styles.color,
                    'font-family': styles.fontFamily,
                    'font-size': styles.fontSize,
                    'font-weight': styles.fontWeight,
                },
                isNil,
            ) as Dictionary<string>;

        return {
            input: mapStyles(options.default),
            '.invalid': mapStyles(options.error),
            ':focus': mapStyles(options.focus),
        };
    }

    private mapFieldType(type: string): BraintreeFormFieldType {
        switch (type) {
            case 'number':
                return this.type === BraintreeHostedFormType.StoredCardVerification
                    ? BraintreeFormFieldType.CardNumberVerification
                    : BraintreeFormFieldType.CardNumber;

            case 'expirationDate':
                return BraintreeFormFieldType.CardExpiry;

            case 'cvv':
                return this.type === BraintreeHostedFormType.StoredCardVerification
                    ? BraintreeFormFieldType.CardCodeVerification
                    : BraintreeFormFieldType.CardCode;

            case 'cardholderName':
                return BraintreeFormFieldType.CardName;

            default:
                throw new Error('Unexpected field type');
        }
    }

    private mapErrors(fields: BraintreeHostedFieldsState['fields']): BraintreeFormErrorsData {
        const errors: BraintreeFormErrorsData = {};

        if (fields) {
            // eslint-disable-next-line no-restricted-syntax
            for (const [key, value] of Object.entries(fields)) {
                if (value && this.isValidParam(key)) {
                    const { isValid, isEmpty, isPotentiallyValid } = value;

                    errors[key] = {
                        isValid,
                        isEmpty,
                        isPotentiallyValid,
                    };
                }
            }
        }

        return errors;
    }

    private mapValidationErrors(
        fields: BraintreeHostedFieldsState['fields'],
    ): BraintreeFormFieldValidateEventData['errors'] {
        return (Object.keys(fields) as Array<keyof BraintreeHostedFieldsState['fields']>).reduce(
            (result, fieldKey) => ({
                ...result,
                [this.mapFieldType(fieldKey)]: fields[fieldKey]?.isValid
                    ? undefined
                    : [this.createInvalidError(this.mapFieldType(fieldKey))],
            }),
            {},
        );
    }

    private mapTokenizeError(
        error: BraintreeHostedFormError,
        isStoredCard = false,
    ): BraintreeFormFieldValidateEventData['errors'] | undefined {
        if (error.code === 'HOSTED_FIELDS_FIELDS_EMPTY') {
            const cvv = [this.createRequiredError(this.mapFieldType('cvv'))];

            if (isStoredCard) {
                return { [this.mapFieldType('cvv')]: cvv };
            }

            return {
                [this.mapFieldType('cvv')]: cvv,
                [this.mapFieldType('expirationDate')]: [
                    this.createRequiredError(this.mapFieldType('expirationDate')),
                ],
                [this.mapFieldType('number')]: [
                    this.createRequiredError(this.mapFieldType('number')),
                ],
                [this.mapFieldType('cardholderName')]: [
                    this.createRequiredError(this.mapFieldType('cardholderName')),
                ],
            };
        }

        return error.details?.invalidFieldKeys?.reduce((result, key) => {
            const type = this.mapFieldType(key);

            return {
                ...result,
                [type]: [this.createInvalidError(type)],
            };
        }, {});
    }

    private createRequiredError(
        fieldType: BraintreeFormFieldType,
    ): BraintreeFormFieldValidateErrorData {
        const messages = {
            [BraintreeFormFieldType.CardCode]: 'CVV is required',
            [BraintreeFormFieldType.CardCodeVerification]: 'CVV is required',
            [BraintreeFormFieldType.CardNumber]: 'Credit card number is required',
            [BraintreeFormFieldType.CardNumberVerification]: 'Credit card number is required',
            [BraintreeFormFieldType.CardExpiry]: 'Expiration date is required',
            [BraintreeFormFieldType.CardName]: 'Full name is required',
        };

        return {
            fieldType,
            message: messages[fieldType] ?? 'Field is required',
            type: 'required',
        };
    }

    private createInvalidError(
        fieldType: BraintreeFormFieldType,
    ): BraintreeFormFieldValidateErrorData {
        const formFields = {
            [BraintreeFormFieldType.CardCode]: {
                message: 'Invalid card code',
                type: 'invalid_card_code',
            },
            [BraintreeFormFieldType.CardCodeVerification]: {
                message: 'Invalid card code',
                type: 'invalid_card_code',
            },
            [BraintreeFormFieldType.CardNumber]: {
                message: 'Invalid card number',
                type: 'invalid_card_number',
            },
            [BraintreeFormFieldType.CardNumberVerification]: {
                message: 'Invalid card number',
                type: 'invalid_card_number',
            },
            [BraintreeFormFieldType.CardExpiry]: {
                message: 'Invalid card expiry',
                type: 'invalid_card_expiry',
            },
            [BraintreeFormFieldType.CardName]: {
                message: 'Invalid card name',
                type: 'invalid_card_name',
            },
        };

        return {
            fieldType,
            message: formFields[fieldType]?.message ?? 'Invalid field',
            type: formFields[fieldType]?.type ?? 'invalid',
        };
    }

    private handleBlur = (event: BraintreeHostedFieldsState): void => {
        this.formOptions?.onBlur?.({
            fieldType: this.mapFieldType(event.emittedBy),
            errors: this.mapErrors(event.fields),
        });
    };

    private handleFocus = (event: BraintreeHostedFieldsState): void => {
        this.formOptions?.onFocus?.({
            fieldType: this.mapFieldType(event.emittedBy),
        });
    };

    private handleCardTypeChange = (event: BraintreeHostedFieldsState): void => {
        const cardType =
            event.cards.length === 1
                ? event.cards[0].type.replace(/^master-card$/, 'mastercard')
                : undefined;

        this.formOptions?.onCardTypeChange?.({ cardType });
    };

    private handleInputSubmitRequest = (event: BraintreeHostedFieldsState): void => {
        this.formOptions?.onEnter?.({
            fieldType: this.mapFieldType(event.emittedBy),
        });
    };

    private handleValidityChange = (event: BraintreeHostedFieldsState): void => {
        this.formOptions?.onValidate?.({
            isValid: this.isValidForm(event),
            errors: this.mapValidationErrors(event.fields),
        });
    };

    private isValidForm(event: BraintreeHostedFieldsState): boolean {
        return (
            Object.keys(event.fields) as Array<keyof BraintreeHostedFieldsState['fields']>
        ).every((key) => event.fields[key]?.isValid);
    }

    private isValidParam(key: string): key is BraintreeFormErrorDataKeys {
        return [
            'number',
            'cvv',
            'expirationDate',
            'postalCode',
            'cardholderName',
            'cardType',
        ].includes(key);
    }
}
