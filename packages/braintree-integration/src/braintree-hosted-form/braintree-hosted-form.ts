import { Dictionary, isEmpty, isNil, omitBy } from 'lodash';
import {
    BraintreeBillingAddressRequestData,
    BraintreeFormErrorDataKeys,
    BraintreeFormErrorsData,
    BraintreeFormOptions,
    BraintreeHostedFields,
    BraintreeHostedFieldsCreatorConfig,
    BraintreeHostedFieldsState,
    BraintreeHostedFormError, BraintreeIntegrationService, BraintreeScriptLoader,
    TokenizationPayload,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    Address,
    NotInitializedError,
    NotInitializedErrorType,
    PaymentInvalidFormError,
    PaymentInvalidFormErrorDetails,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    BraintreeFormFieldsMap,
    BraintreeFormFieldStyles,
    BraintreeFormFieldStylesMap,
    BraintreeFormFieldType,
    BraintreeFormFieldValidateErrorData,
    BraintreeFormFieldValidateEventData,
    BraintreeStoredCardFieldsMap,
} from '../braintree-payment-options';
import { isBraintreeHostedFormError } from '../../../braintree-utils/src/is-braintree-hosted-form-error';
import { isBraintreeFormFieldsMap } from '../../../braintree-utils/src/is-braintree-form-fields-map';
import { isBraintreeSupportedCardBrand } from '../../../braintree-utils/src/is-braintree-supported-card-brand';

enum BraintreeHostedFormType {
    CreditCard,
    StoredCardVerification,
}

export default class BraintreeHostedForm {
    private cardFields?: BraintreeHostedFields;
    private formOptions?: BraintreeFormOptions;
    private type?: BraintreeHostedFormType;
    private isInitializedHostedForm = false;

    constructor(
        private braintreeIntegrationService: BraintreeIntegrationService,
        private braintreeScriptLoader: BraintreeScriptLoader,
    ) {}

    async initialize(
        options: BraintreeFormOptions,
        unsupportedCardBrands?: string[],
    ): Promise<void> {
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

    validate() {
        if (!this.cardFields) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const braintreeHostedFormState = this.cardFields.getState();

        if (!this.isValidForm(braintreeHostedFormState)) {
            this.handleValidityChange(braintreeHostedFormState);

            const errors = this.mapValidationErrors(braintreeHostedFormState.fields);

            throw new PaymentInvalidFormError(errors as PaymentInvalidFormErrorDetails);
        }
    }

    async tokenize(billingAddress: Address): Promise<TokenizationPayload> {
        if (!this.cardFields) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        try {
            const tokenizationPayload = await this.cardFields.tokenize(
                omitBy(
                    {
                        billingAddress: billingAddress && this.mapBillingAddress(billingAddress),
                    },
                    isNil,
                ),
            );

            this.formOptions?.onValidate?.({
                isValid: true,
                errors: {},
            });

            return {
                nonce: tokenizationPayload.nonce,
                bin: tokenizationPayload.details?.bin,
            };
        } catch (error) {
            if (isBraintreeHostedFormError(error)) {
                const errors = this.mapTokenizeError(error);

                if (errors) {
                    this.formOptions?.onValidate?.({
                        isValid: false,
                        errors,
                    });

                    throw new PaymentInvalidFormError(errors as PaymentInvalidFormErrorDetails);
                }
            }

            throw error;
        }
    }

    async createHostedFields(
        options: Pick<BraintreeHostedFieldsCreatorConfig, 'fields' | 'styles'>,
    ): Promise<BraintreeHostedFields> {
        const [client, hostedFields] = await Promise.all([
            this.braintreeIntegrationService.getClient(),
            this.braintreeScriptLoader.loadHostedFields(),
        ]);

        return hostedFields.create({ ...options, client });
    }

    async tokenizeForStoredCardVerification(): Promise<TokenizationPayload> {
        if (!this.cardFields) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        try {
            const tokenizationPayload = await this.cardFields.tokenize();

            this.formOptions?.onValidate?.({
                isValid: true,
                errors: {},
            });

            return {
                nonce: tokenizationPayload.nonce,
                bin: tokenizationPayload.details?.bin,
            };
        } catch (error) {
            if (isBraintreeHostedFormError(error)) {
                const errors = this.mapTokenizeError(error, true);

                if (errors) {
                    this.formOptions?.onValidate?.({
                        isValid: false,
                        errors,
                    });

                    throw new PaymentInvalidFormError(errors as PaymentInvalidFormErrorDetails);
                }
            }

            throw error;
        }
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

            if (unsupportedCardBrands) {
                for (const cardBrand of unsupportedCardBrands) {
                    if (isBraintreeSupportedCardBrand(cardBrand)) {
                        supportedCardBrands[cardBrand] = false;
                    }
                }
            }

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
            const cvvValidation = {
                [this.mapFieldType('cvv')]: [this.createRequiredError(this.mapFieldType('cvv'))],
            };

            const expirationDateValidation = {
                [this.mapFieldType('expirationDate')]: [
                    this.createRequiredError(this.mapFieldType('expirationDate')),
                ],
            };

            const cardNumberValidation = {
                [this.mapFieldType('number')]: [
                    this.createRequiredError(this.mapFieldType('number')),
                ],
            };

            const cardNameValidation = {
                [this.mapFieldType('cardholderName')]: [
                    this.createRequiredError(this.mapFieldType('cardholderName')),
                ],
            };

            return isStoredCard
                ? cvvValidation
                : {
                    ...cvvValidation,
                    ...expirationDateValidation,
                    ...cardNumberValidation,
                    ...cardNameValidation,
                };
        }

        return error.details?.invalidFieldKeys?.reduce(
            (result, fieldKey) => ({
                ...result,
                [this.mapFieldType(fieldKey)]: [
                    this.createInvalidError(this.mapFieldType(fieldKey)),
                ],
            }),
            {},
        );
    }

    private createRequiredError(
        fieldType: BraintreeFormFieldType,
    ): BraintreeFormFieldValidateErrorData {
        switch (fieldType) {
            case BraintreeFormFieldType.CardCodeVerification:
            case BraintreeFormFieldType.CardCode:
                return {
                    fieldType,
                    message: 'CVV is required',
                    type: 'required',
                };

            case BraintreeFormFieldType.CardNumberVerification:
            case BraintreeFormFieldType.CardNumber:
                return {
                    fieldType,
                    message: 'Credit card number is required',
                    type: 'required',
                };

            case BraintreeFormFieldType.CardExpiry:
                return {
                    fieldType,
                    message: 'Expiration date is required',
                    type: 'required',
                };

            case BraintreeFormFieldType.CardName:
                return {
                    fieldType,
                    message: 'Full name is required',
                    type: 'required',
                };

            default:
                return {
                    fieldType,
                    message: 'Field is required',
                    type: 'required',
                };
        }
    }

    private createInvalidError(
        fieldType: BraintreeFormFieldType,
    ): BraintreeFormFieldValidateErrorData {
        switch (fieldType) {
            case BraintreeFormFieldType.CardCodeVerification:
                return {
                    fieldType,
                    message: 'Invalid card code',
                    type: 'invalid_card_code',
                };

            case BraintreeFormFieldType.CardNumberVerification:
                return {
                    fieldType,
                    message: 'Invalid card number',
                    type: 'invalid_card_number',
                };

            case BraintreeFormFieldType.CardCode:
                return {
                    fieldType,
                    message: 'Invalid card code',
                    type: 'invalid_card_code',
                };

            case BraintreeFormFieldType.CardExpiry:
                return {
                    fieldType,
                    message: 'Invalid card expiry',
                    type: 'invalid_card_expiry',
                };

            case BraintreeFormFieldType.CardNumber:
                return {
                    fieldType,
                    message: 'Invalid card number',
                    type: 'invalid_card_number',
                };

            case BraintreeFormFieldType.CardName:
                return {
                    fieldType,
                    message: 'Invalid card name',
                    type: 'invalid_card_name',
                };

            default:
                return {
                    fieldType,
                    message: 'Invalid field',
                    type: 'invalid',
                };
        }
    }

    private handleBlur: (event: BraintreeHostedFieldsState) => void = (event) => {
        this.formOptions?.onBlur?.({
            fieldType: this.mapFieldType(event.emittedBy),
            errors: this.mapErrors(event.fields),
        });
    };

    private handleFocus: (event: BraintreeHostedFieldsState) => void = (event) => {
        this.formOptions?.onFocus?.({
            fieldType: this.mapFieldType(event.emittedBy),
        });
    };

    private handleCardTypeChange: (event: BraintreeHostedFieldsState) => void = (event) => {
        this.formOptions?.onCardTypeChange?.({
            cardType:
                event.cards.length === 1
                    ? event.cards[0].type.replace(/^master\-card$/, 'mastercard',) /* eslint-disable-line */
                    : undefined,
        });
    };

    private handleInputSubmitRequest: (event: BraintreeHostedFieldsState) => void = (event) => {
        this.formOptions?.onEnter?.({
            fieldType: this.mapFieldType(event.emittedBy),
        });
    };

    private handleValidityChange: (event: BraintreeHostedFieldsState) => void = (event) => {
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

    private isValidParam(
        formErrorDataKey: string,
    ): formErrorDataKey is BraintreeFormErrorDataKeys {
        switch (formErrorDataKey) {
            case 'number':
            case 'cvv':
            case 'expirationDate':
            case 'postalCode':
            case 'cardholderName':
            case 'cardType':
                return true;

            default:
                return false;
        }
    }
}
