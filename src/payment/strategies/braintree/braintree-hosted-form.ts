import { isEmpty, isNil, omitBy, Dictionary } from 'lodash';

import { Address } from '../../../address';
import { NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { PaymentInvalidFormError, PaymentInvalidFormErrorDetails } from '../../errors';
import { NonceInstrument } from '../../payment';

import { BraintreeBillingAddressRequestData, BraintreeHostedFields, BraintreeHostedFieldsCreatorConfig, BraintreeHostedFieldsState, BraintreeHostedFormError } from './braintree';
import { BraintreeFormFieldsMap, BraintreeFormFieldStyles, BraintreeFormFieldStylesMap, BraintreeFormFieldType, BraintreeFormFieldValidateErrorData, BraintreeFormFieldValidateEventData, BraintreeFormOptions, BraintreeStoredCardFieldsMap } from './braintree-payment-options';
import BraintreeRegularField from './braintree-regular-field';
import BraintreeSDKCreator from './braintree-sdk-creator';
import { isBraintreeFormFieldsMap } from './is-braintree-form-fields-map';

enum BraintreeHostedFormType {
    CreditCard,
    StoredCardVerification,
}

export default class BraintreeHostedForm {
    private _cardFields?: BraintreeHostedFields;
    private _cardNameField?: BraintreeRegularField;
    private _formOptions?: BraintreeFormOptions;
    private _type?: BraintreeHostedFormType;

    constructor(
        private _braintreeSDKCreator: BraintreeSDKCreator
    ) {}

    async initialize(options: BraintreeFormOptions): Promise<boolean> {
        this._formOptions = options;

        this._type = isBraintreeFormFieldsMap(options.fields) ?
            BraintreeHostedFormType.CreditCard :
            BraintreeHostedFormType.StoredCardVerification;

        const fields = this._mapFieldOptions(options.fields);

        if (isEmpty(fields)) {
            return false;
        }

        this._cardFields = await this._braintreeSDKCreator.createHostedFields({
            fields,
            styles: options.styles && this._mapStyleOptions(options.styles),
        });

        this._cardFields.on('blur', this._handleBlur);
        this._cardFields.on('focus', this._handleFocus);
        this._cardFields.on('cardTypeChange', this._handleCardTypeChange);
        this._cardFields.on('validityChange', this._handleValidityChange);
        this._cardFields.on('inputSubmitRequest', this._handleInputSubmitRequest);

        if (isBraintreeFormFieldsMap(options.fields)) {
            this._cardNameField = new BraintreeRegularField(
                options.fields.cardName,
                options.styles
            );
            this._cardNameField.on('blur', this._handleNameBlur);
            this._cardNameField.on('focus', this._handleNameFocus);
            this._cardNameField.attach();
        }

        return true;
    }

    async deinitialize(): Promise<void> {
        await this._cardFields?.teardown();
        this._cardNameField?.detach();
    }

    async tokenize(billingAddress: Address): Promise<NonceInstrument> {
        if (!this._cardFields) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        try {
            const { nonce } = await this._cardFields.tokenize(omitBy({
                billingAddress: billingAddress && this._mapBillingAddress(billingAddress),
                cardholderName: this._cardNameField?.getValue(),
            }, isNil));

            this._formOptions?.onValidate?.({
                isValid: true,
                errors: {},
            });

            return { nonce };
        } catch (error) {
            const errors = this._mapTokenizeError(error);

            if (errors) {
                this._formOptions?.onValidate?.({
                    isValid: false,
                    errors,
                });

                throw new PaymentInvalidFormError(errors as PaymentInvalidFormErrorDetails);
            }

            throw error;
        }
    }

    async tokenizeForStoredCardVerification(): Promise<NonceInstrument> {
        if (!this._cardFields) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        try {
            const { nonce } = await this._cardFields.tokenize(omitBy({
                cardholderName: this._cardNameField?.getValue(),
            }, isNil));

            this._formOptions?.onValidate?.({
                isValid: true,
                errors: {},
            });

            return { nonce };
        } catch (error) {
            const errors = this._mapTokenizeError(error);

            if (errors) {
                this._formOptions?.onValidate?.({
                    isValid: false,
                    errors,
                });

                throw new PaymentInvalidFormError(errors as PaymentInvalidFormErrorDetails);
            }

            throw error;
        }
    }

    private _mapBillingAddress(billingAddress: Address): BraintreeBillingAddressRequestData {
        return {
            countryName: billingAddress.country,
            postalCode: billingAddress.postalCode,
            streetAddress: billingAddress.address2 ?
                `${billingAddress.address1} ${billingAddress.address2}` :
                billingAddress.address1,
        };
    }

    private _mapFieldOptions(
        fields: BraintreeFormFieldsMap | BraintreeStoredCardFieldsMap
    ): BraintreeHostedFieldsCreatorConfig['fields'] {
        if (isBraintreeFormFieldsMap(fields)) {
            return omitBy({
                number: {
                    container: `#${fields.cardNumber.containerId}`,
                    placeholder: fields.cardNumber.placeholder,
                },
                expirationDate: {
                    container: `#${fields.cardExpiry.containerId}`,
                    placeholder: fields.cardExpiry.placeholder,
                },
                cvv: fields.cardCode && {
                    container: `#${fields.cardCode.containerId}`,
                    placeholder: fields.cardCode.placeholder,
                },
            }, isNil);
        }

        return omitBy({
            number: fields.cardNumberVerification && {
                container: `#${fields.cardNumberVerification.containerId}`,
                placeholder: fields.cardNumberVerification.placeholder,
            },
            cvv: fields.cardCodeVerification && {
                container: `#${fields.cardCodeVerification.containerId}`,
                placeholder: fields.cardCodeVerification.placeholder,
            },
        }, isNil);
    }

    private _mapStyleOptions(
        options: BraintreeFormFieldStylesMap
    ): BraintreeHostedFieldsCreatorConfig['styles'] {
        const mapStyles = (styles: BraintreeFormFieldStyles = {}) => omitBy({
            color: styles.color,
            'font-family': styles.fontFamily,
            'font-size': styles.fontSize,
            'font-weight': styles.fontWeight,
        }, isNil) as Dictionary<string>;

        return {
            input: mapStyles(options.default),
            '.invalid': mapStyles(options.error),
            ':focus': mapStyles(options.focus),
        };
    }

    private _mapFieldType(type: string): BraintreeFormFieldType {
        switch (type) {
        case 'number':
            return this._type === BraintreeHostedFormType.StoredCardVerification ?
                BraintreeFormFieldType.CardNumberVerification :
                BraintreeFormFieldType.CardNumber;

        case 'expirationDate':
            return BraintreeFormFieldType.CardExpiry;

        case 'cvv':
            return this._type === BraintreeHostedFormType.StoredCardVerification ?
                BraintreeFormFieldType.CardCodeVerification :
                BraintreeFormFieldType.CardCode;

        default:
            throw new Error('Unexpected field type');
        }
    }

    private _mapValidationErrors(
        fields: BraintreeHostedFieldsState['fields']
    ): BraintreeFormFieldValidateEventData['errors'] {
        return (Object.keys(fields) as Array<keyof BraintreeHostedFieldsState['fields']>)
            .reduce((result, fieldKey) => ({
                ...result,
                [this._mapFieldType(fieldKey)]: fields[fieldKey]?.isValid ? undefined : [
                    this._createInvalidError(this._mapFieldType(fieldKey)),
                ],
            }), {});
    }

    private _mapTokenizeError(
        error: BraintreeHostedFormError
    ): BraintreeFormFieldValidateEventData['errors'] | undefined {
        if (error.code === 'HOSTED_FIELDS_FIELDS_EMPTY') {
            return {
                [this._mapFieldType('cvv')]: [
                    this._createRequiredError(this._mapFieldType('cvv')),
                ],
                [this._mapFieldType('expirationDate')]: [
                    this._createRequiredError(this._mapFieldType('expirationDate')),
                ],
                [this._mapFieldType('number')]: [
                    this._createRequiredError(this._mapFieldType('number')),
                ],
            };
        }

        return error?.details?.invalidFieldKeys?.reduce((result, fieldKey) => ({
            ...result,
            [this._mapFieldType(fieldKey)]: [
                this._createInvalidError(this._mapFieldType(fieldKey)),
            ],
        }), {});
    }

    private _createRequiredError(fieldType: BraintreeFormFieldType): BraintreeFormFieldValidateErrorData {
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

    private _createInvalidError(fieldType: BraintreeFormFieldType): BraintreeFormFieldValidateErrorData {
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

        default:
            return {
                fieldType,
                message: 'Invalid field',
                type: 'invalid',
            };
        }
    }

    private _handleBlur: (event: BraintreeHostedFieldsState) => void = event => {
        this._formOptions?.onBlur?.({
            fieldType: this._mapFieldType(event.emittedBy),
        });
    };

    private _handleNameBlur: () => void = () => {
        this._formOptions?.onBlur?.({
            fieldType: BraintreeFormFieldType.CardName,
        });
    };

    private _handleFocus: (event: BraintreeHostedFieldsState) => void = event => {
        this._formOptions?.onFocus?.({
            fieldType: this._mapFieldType(event.emittedBy),
        });
    };

    private _handleNameFocus: () => void = () => {
        this._formOptions?.onFocus?.({
            fieldType: BraintreeFormFieldType.CardName,
        });
    };

    private _handleCardTypeChange: (event: BraintreeHostedFieldsState) => void = event => {
        this._formOptions?.onCardTypeChange?.({
            cardType: event.cards[0]?.type,
        });
    };

    private _handleInputSubmitRequest: (event: BraintreeHostedFieldsState) => void = event => {
        this._formOptions?.onEnter?.({
            fieldType: this._mapFieldType(event.emittedBy),
        });
    };

    private _handleValidityChange: (event: BraintreeHostedFieldsState) => void = event => {
        this._formOptions?.onValidate?.({
            isValid: (Object.keys(event.fields) as Array<keyof BraintreeHostedFieldsState['fields']>)
                .every(key => event.fields[key]?.isValid),
            errors: this._mapValidationErrors(event.fields),
        });
    };
}
