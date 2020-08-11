import { isNil, kebabCase, omitBy } from 'lodash';

import { NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';

import { PaypalCommerceFormFieldStyles, PaypalCommerceFormFieldStylesMap, PaypalCommerceFormFieldType, PaypalCommerceFormFieldValidateEventData, PaypalCommerceFormOptions, PaypalCommerceHostedFields, PaypalCommerceHostedFieldsRenderOptions, PaypalCommerceHostedFieldsState, PaypalCommerceRegularField, PaypalCommerceRequestSender, PaypalCommerceSDK } from './index';
import { PaypalCommerceFormFieldsMap, PaypalCommerceStoredCardFieldsMap } from './paypal-commerce-payment-initialize-options';

enum PaypalCommerceHostedFormType {
    CreditCard,
    StoredCardVerification,
}

export default class PaypalCommerceHostedForm {
    private _formOptions?: PaypalCommerceFormOptions;
    private _cardNameField?: PaypalCommerceRegularField;
    private _hostedFields?: PaypalCommerceHostedFields;
    private _type?: PaypalCommerceHostedFormType;

    constructor(
        private _paypalCommerceRequestSender: PaypalCommerceRequestSender
    ) {}

    async initialize(options: PaypalCommerceFormOptions, cartId: string, paypal: PaypalCommerceSDK) {
        if (!paypal.HostedFields) {
            return false;
        }

        this._formOptions = options;
        this._type = this._isPaypalCommerceFormFieldsMap(options.fields) ?
            PaypalCommerceHostedFormType.CreditCard :
            PaypalCommerceHostedFormType.StoredCardVerification;

        if (paypal.HostedFields.isEligible()) {
            if (this._isPaypalCommerceFormFieldsMap(options.fields)) {
                this._cardNameField = new PaypalCommerceRegularField(
                    options.fields.cardName,
                    options.styles
                );
                this._cardNameField.attach();
            }

            this._hostedFields = await paypal.HostedFields.render({
                paymentsSDK: true,
                fields: this._mapFieldOptions(options.fields),
                styles: options.styles && this._mapStyleOptions(options.styles),
                createOrder: () => this._setupPayment(cartId),
            });

            this._hostedFields.on('blur', this._handleBlur);
            this._hostedFields.on('focus', this._handleFocus);
            this._hostedFields.on('cardTypeChange', this._handleCardTypeChange);
            this._hostedFields.on('validityChange', this._handleValidityChange);
            this._hostedFields.on('inputSubmitRequest', this._handleInputSubmitRequest);

        }
    }

    async submit(): Promise<{orderId: string}> {
        if (!this._hostedFields) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._hostedFields.submit();
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

    private async _setupPayment(cartId: string): Promise<string> {
        const { orderId } = await this._paypalCommerceRequestSender.setupPayment('paypalcommercecreditcardscheckout', cartId);

        return orderId;
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
