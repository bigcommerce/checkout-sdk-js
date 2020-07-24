import { isNil, omitBy, Dictionary } from 'lodash';

import { Address } from '../../../address';
import { NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { NonceInstrument } from '../../payment';

import { BraintreeBillingAddressRequestData, BraintreeHostedFields, BraintreeHostedFieldsCreatorConfig, BraintreeHostedFieldsState } from './braintree';
import { BraintreeFormFieldsMap, BraintreeFormFieldStyles, BraintreeFormFieldStylesMap, BraintreeFormFieldType, BraintreeFormFieldValidateEventData, BraintreeFormOptions, BraintreeStoredCardFieldsMap } from './braintree-payment-options';
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

    async initialize(options: BraintreeFormOptions): Promise<void> {
        this._formOptions = options;

        this._type = isBraintreeFormFieldsMap(options.fields) ?
            BraintreeHostedFormType.CreditCard :
            BraintreeHostedFormType.StoredCardVerification;

        this._cardFields = await this._braintreeSDKCreator.createHostedFields({
            fields: this._mapFieldOptions(options.fields),
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
            this._cardNameField.attach();
        }
    }

    async deinitialize(): Promise<void> {
        await this._cardFields?.teardown();
        this._cardNameField?.detach();
    }

    async tokenize(billingAddress: Address): Promise<NonceInstrument> {
        if (!this._cardFields) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const { nonce } = await this._cardFields.tokenize(omitBy({
            billingAddress: billingAddress && this._mapBillingAddress(billingAddress),
            cardholderName: this._cardNameField?.getValue(),
        }, isNil));

        return { nonce };
    }

    async tokenizeForStoredCardVerification(): Promise<NonceInstrument> {
        if (!this._cardFields) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const { nonce } = await this._cardFields.tokenize(omitBy({
            cardholderName: this._cardNameField?.getValue(),
        }, isNil));

        return { nonce };
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

    private _mapStoredCardVerificationErrors(
        fields: BraintreeHostedFieldsState['fields']
    ): BraintreeFormFieldValidateEventData['errors'] {
        return this._type === BraintreeHostedFormType.StoredCardVerification ?
            {
                [BraintreeFormFieldType.CardCodeVerification]: !fields.cvv || fields.cvv.isValid ? undefined : [{
                    fieldType: 'cardCodeVerification',
                    message: 'Invalid card code',
                    type: 'invalid_card_code',
                }],
                [BraintreeFormFieldType.CardNumberVerification]: !fields.number || fields.number.isValid ? undefined : [{
                    fieldType: 'cardNumberVerification',
                    message: 'Invalid card number',
                    type: 'invalid_card_number',
                }],
            } :
            {
                [BraintreeFormFieldType.CardCode]: !fields.cvv || fields.cvv.isValid ? undefined : [{
                    fieldType: 'cardCode',
                    message: 'Invalid card number',
                    type: 'invalid_card_number',
                }],
                [BraintreeFormFieldType.CardExpiry]: !fields.expirationDate || fields.expirationDate.isValid ? undefined : [{
                    fieldType: 'cardExpiry',
                    message: 'Invalid card number',
                    type: 'invalid_card_number',
                }],
                [BraintreeFormFieldType.CardNumber]: !fields.number || fields.number.isValid ? undefined : [{
                    fieldType: 'cardNumber',
                    message: 'Invalid card number',
                    type: 'invalid_card_number',
                }],
            };
    }

    private _handleBlur: (event: BraintreeHostedFieldsState) => void = event => {
        if (!this._formOptions?.onBlur) {
            return;
        }

        this._formOptions.onBlur({
            fieldType: this._mapFieldType(event.emittedBy),
        });
    };

    private _handleFocus: (event: BraintreeHostedFieldsState) => void = event => {
        if (!this._formOptions?.onFocus) {
            return;
        }

        this._formOptions.onFocus({
            fieldType: this._mapFieldType(event.emittedBy),
        });
    };

    private _handleCardTypeChange: (event: BraintreeHostedFieldsState) => void = event => {
        if (!this._formOptions?.onCardTypeChange) {
            return;
        }

        this._formOptions.onCardTypeChange({
            cardType: event.cards[0]?.type,
        });
    };

    private _handleInputSubmitRequest: (event: BraintreeHostedFieldsState) => void = event => {
        if (!this._formOptions?.onEnter) {
            return;
        }

        this._formOptions.onEnter({
            fieldType: this._mapFieldType(event.emittedBy),
        });
    };

    private _handleValidityChange: (event: BraintreeHostedFieldsState) => void = event => {
        if (!this._formOptions?.onValidate) {
            return;
        }

        this._formOptions.onValidate({
            isValid: (Object.keys(event.fields) as Array<keyof BraintreeHostedFieldsState['fields']>)
                .every(key => event.fields[key]?.isValid),
            errors: this._mapStoredCardVerificationErrors(event.fields),
        });
    };
}
