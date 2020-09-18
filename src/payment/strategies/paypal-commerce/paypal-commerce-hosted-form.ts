import { isNil, kebabCase, omitBy } from 'lodash';

import { DataPaypalCommerceScript, PaypalCommerceFormFieldStyles, PaypalCommerceFormFieldStylesMap, PaypalCommerceFormFieldType, PaypalCommerceFormFieldValidateEventData, PaypalCommerceFormOptions, PaypalCommerceHostedFieldsRenderOptions, PaypalCommerceHostedFieldsState, PaypalCommercePaymentProcessor, PaypalCommerceRegularField } from './index';
import { PaypalCommerceFormFieldsMap, PaypalCommerceStoredCardFieldsMap } from './paypal-commerce-payment-initialize-options';

enum PaypalCommerceHostedFormType {
    CreditCard,
    StoredCardVerification,
}

export default class PaypalCommerceHostedForm {
    private _formOptions?: PaypalCommerceFormOptions;
    private _cardNameField?: PaypalCommerceRegularField;
    private _type?: PaypalCommerceHostedFormType;

    constructor(
        private _paypalCommercePaymentProcessor: PaypalCommercePaymentProcessor
    ) {}

    async initialize(options: PaypalCommerceFormOptions, cartId: string, paramsScript: DataPaypalCommerceScript) {
        await this._paypalCommercePaymentProcessor.initialize(paramsScript);

        this._formOptions = options;
        this._type = this._isPaypalCommerceFormFieldsMap(options.fields) ?
            PaypalCommerceHostedFormType.CreditCard :
            PaypalCommerceHostedFormType.StoredCardVerification;
        const params = {
            fields: this._mapFieldOptions(options.fields),
            styles: options.styles && this._mapStyleOptions(options.styles),
        };
        const events = {
            blur: this._handleBlur,
            focus: this._handleFocus,
            cardTypeChange: this._handleCardTypeChange,
            validityChange: this._handleValidityChange,
            inputSubmitRequest: this._handleInputSubmitRequest,
        };

        await this._paypalCommercePaymentProcessor.renderHostedFields(cartId, params, events);

        if (this._isPaypalCommerceFormFieldsMap(options.fields)) {
            this._cardNameField = new PaypalCommerceRegularField(
                options.fields.cardName,
                options.styles
            );
            this._cardNameField.attach();
        }
    }

    async submit(): Promise<{orderId: string}> {
        return this._paypalCommercePaymentProcessor.submitHostedFields();
    }

    private _mapFieldOptions(fields: PaypalCommerceFormFieldsMap | PaypalCommerceStoredCardFieldsMap): PaypalCommerceHostedFieldsRenderOptions['fields'] {
        if (this._isPaypalCommerceFormFieldsMap(fields)) {
            return omitBy({
                number: {
                    selector: `#${fields.cardNumber.containerId}`,
                    placeholder: fields.cardNumber.placeholder,
                },
                expirationDate: {
                    selector: `#${fields.cardExpiry.containerId}`,
                    placeholder: fields.cardExpiry.placeholder,
                },
                cvv: fields.cardCode && {
                    selector: `#${fields.cardCode.containerId}`,
                    placeholder: fields.cardCode.placeholder,
                },
            }, isNil);
        }

        return omitBy({
            number: fields.cardNumberVerification && {
                selector: `#${fields.cardNumberVerification.containerId}`,
                placeholder: fields.cardNumberVerification.placeholder,
            },
            cvv: fields.cardCodeVerification && {
                selector: `#${fields.cardCodeVerification.containerId}`,
                placeholder: fields.cardCodeVerification.placeholder,
            },
        }, isNil);
    }

    private _mapStyleOptions(options: PaypalCommerceFormFieldStylesMap): PaypalCommerceHostedFieldsRenderOptions['styles'] {
        const mapStyles = (styles: PaypalCommerceFormFieldStyles = {}) => {
            return (Object.keys(styles) as Array<keyof PaypalCommerceFormFieldStyles>).reduce((updatedStyles, key) =>
                styles[key] ?  { ...updatedStyles, [kebabCase(key)]: styles[key] } : updatedStyles
            , {});
        };

        return {
            input: mapStyles(options.default),
            '.invalid': mapStyles(options.error),
            ':focus': mapStyles(options.focus),
        };
    }

    private _isPaypalCommerceFormFieldsMap(fields: PaypalCommerceFormFieldsMap | PaypalCommerceStoredCardFieldsMap): fields is PaypalCommerceFormFieldsMap {
        return !!(fields as PaypalCommerceFormFieldsMap).cardNumber;
    }

    private _mapFieldType(type: string): PaypalCommerceFormFieldType {
        switch (type) {
            case 'number':
                return this._type === PaypalCommerceHostedFormType.StoredCardVerification ?
                    PaypalCommerceFormFieldType.CardNumberVerification :
                    PaypalCommerceFormFieldType.CardNumber;

            case 'expirationDate':
                return PaypalCommerceFormFieldType.CardExpiry;

            case 'cvv':
                return this._type === PaypalCommerceHostedFormType.StoredCardVerification ?
                    PaypalCommerceFormFieldType.CardCodeVerification :
                    PaypalCommerceFormFieldType.CardCode;

            default:
                throw new Error('Unexpected field type');
        }
    }

    private _mapStoredCardVerificationErrors(
        fields: PaypalCommerceHostedFieldsState['fields']
    ): PaypalCommerceFormFieldValidateEventData['errors'] {
        return this._type === PaypalCommerceHostedFormType.StoredCardVerification ?
            {
                [PaypalCommerceFormFieldType.CardCodeVerification]: !fields.cvv || fields.cvv.isValid ? undefined : [{
                    fieldType: 'cardCodeVerification',
                    message: 'Invalid card code',
                    type: 'invalid_card_code',
                }],
                [PaypalCommerceFormFieldType.CardNumberVerification]: !fields.number || fields.number.isValid ? undefined : [{
                    fieldType: 'cardNumberVerification',
                    message: 'Invalid card number',
                    type: 'invalid_card_number',
                }],
            } :
            {
                [PaypalCommerceFormFieldType.CardCode]: !fields.cvv || fields.cvv.isValid ? undefined : [{
                    fieldType: 'cardCode',
                    message: 'Invalid card number',
                    type: 'invalid_card_number',
                }],
                [PaypalCommerceFormFieldType.CardExpiry]: !fields.expirationDate || fields.expirationDate.isValid ? undefined : [{
                    fieldType: 'cardExpiry',
                    message: 'Invalid card number',
                    type: 'invalid_card_number',
                }],
                [PaypalCommerceFormFieldType.CardNumber]: !fields.number || fields.number.isValid ? undefined : [{
                    fieldType: 'cardNumber',
                    message: 'Invalid card number',
                    type: 'invalid_card_number',
                }],
            };
    }

    private _handleBlur: (event: PaypalCommerceHostedFieldsState)  => void = event => {
        if (!this._formOptions?.onBlur) {
            return;
        }

        this._formOptions.onBlur({
            fieldType: this._mapFieldType(event.emittedBy),
        });
    };

    private _handleFocus: (event: PaypalCommerceHostedFieldsState)  => void = event => {
        if (!this._formOptions?.onFocus) {
            return;
        }

        this._formOptions.onFocus({
            fieldType: this._mapFieldType(event.emittedBy),
        });
    };

    private _handleCardTypeChange: (event: PaypalCommerceHostedFieldsState)  => void = event => {
        if (!this._formOptions?.onCardTypeChange) {
            return;
        }

        this._formOptions.onCardTypeChange({
            cardType: event.cards[0]?.type,
        });
    };

    private _handleInputSubmitRequest: (event: PaypalCommerceHostedFieldsState)  => void = event => {
        if (!this._formOptions?.onEnter) {
            return;
        }

        this._formOptions.onEnter({
            fieldType: this._mapFieldType(event.emittedBy),
        });
    };

    private _handleValidityChange: (event: PaypalCommerceHostedFieldsState)  => void = event => {
        if (!this._formOptions?.onValidate) {
            return;
        }

        this._formOptions.onValidate({
            isValid: (Object.keys(event.fields) as Array<keyof PaypalCommerceHostedFieldsState['fields']>)
                .every(key => event.fields[key]?.isValid),
            errors: this._mapStoredCardVerificationErrors(event.fields),
        });
    };

}
