import { isNil, kebabCase, omitBy } from 'lodash';

import { PaymentInvalidFormError, PaymentInvalidFormErrorDetails, PaymentMethodFailedError } from '../../errors';

import { PaypalCommerceFormFieldStyles, PaypalCommerceFormFieldStylesMap, PaypalCommerceFormFieldType, PaypalCommerceFormFieldValidateErrorData, PaypalCommerceFormFieldValidateEventData, PaypalCommerceFormOptions, PaypalCommerceHostedFieldsApprove, PaypalCommerceHostedFieldsRenderOptions, PaypalCommerceHostedFieldsState, PaypalCommerceHostedFieldsSubmitOptions, PaypalCommercePaymentProcessor, PaypalCommerceRegularField, PaypalCommerceScriptParams } from './index';
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
    ) {
    }

    async initialize(options: PaypalCommerceFormOptions, cartId: string, paramsScript: PaypalCommerceScriptParams) {
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

    async submit(is3dsEnabled?: boolean): Promise<PaypalCommerceHostedFieldsApprove> {
        this.validate();
        const options: PaypalCommerceHostedFieldsSubmitOptions = {
            cardholderName: this._cardNameField?.getValue(),
            contingencies: is3dsEnabled ? ['3D_SECURE'] : undefined,
        };

        const result = await this._paypalCommercePaymentProcessor.submitHostedFields(options);

        if (is3dsEnabled && (result.liabilityShift === 'NO' || result.liabilityShift === 'UNKNOWN')) {
            throw new PaymentMethodFailedError('Failed authentication. Please try to authorize again.');
        }

        return result;
    }

    validate(): void {
        const { isValid, fields } = this._paypalCommercePaymentProcessor.getHostedFieldsValidationState();

        if (isValid) {
            return;
        }

        const errors = this._mapValidationErrors(fields);

        this._formOptions?.onValidate?.({
            errors,
            isValid: false,
        });

        throw new PaymentInvalidFormError(errors as PaymentInvalidFormErrorDetails);
    }

    deinitialize(): void {
        this._paypalCommercePaymentProcessor.deinitialize();
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

    private _mapValidationErrors(
        fields: PaypalCommerceHostedFieldsState['fields']
    ): PaypalCommerceFormFieldValidateEventData['errors'] {
        return (Object.keys(fields) as Array<keyof PaypalCommerceHostedFieldsState['fields']>)
            .reduce((result, fieldKey) => ({
                ...result,
                [this._mapFieldType(fieldKey)]: fields[fieldKey]?.isValid ? undefined : [
                    this._createInvalidError(this._mapFieldType(fieldKey)),
                ],
            }), {});
    }

    private _createInvalidError(fieldType: PaypalCommerceFormFieldType): PaypalCommerceFormFieldValidateErrorData {
        switch (fieldType) {
            case PaypalCommerceFormFieldType.CardCodeVerification:
                return {
                    fieldType,
                    message: 'Invalid card code',
                    type: 'invalid_card_code',
                };

            case PaypalCommerceFormFieldType.CardNumberVerification:
                return {
                    fieldType,
                    message: 'Invalid card number',
                    type: 'invalid_card_number',
                };

            case PaypalCommerceFormFieldType.CardCode:
                return {
                    fieldType,
                    message: 'Invalid card code',
                    type: 'invalid_card_code',
                };

            case PaypalCommerceFormFieldType.CardExpiry:
                return {
                    fieldType,
                    message: 'Invalid card expiry',
                    type: 'invalid_card_expiry',
                };

            case PaypalCommerceFormFieldType.CardNumber:
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

    private _handleBlur: (event: PaypalCommerceHostedFieldsState) => void = event => {
        this._formOptions?.onBlur?.({
            fieldType: this._mapFieldType(event.emittedBy),
        });
    };

    private _handleFocus: (event: PaypalCommerceHostedFieldsState) => void = event => {
        this._formOptions?.onFocus?.({
            fieldType: this._mapFieldType(event.emittedBy),
        });
    };

    private _handleCardTypeChange: (event: PaypalCommerceHostedFieldsState) => void = event => {
        this._formOptions?.onCardTypeChange?.({
            cardType: event.cards[0]?.type,
        });
    };

    private _handleInputSubmitRequest: (event: PaypalCommerceHostedFieldsState) => void = event => {
        this._formOptions?.onEnter?.({
            fieldType: this._mapFieldType(event.emittedBy),
        });
    };

    private _handleValidityChange: (event: PaypalCommerceHostedFieldsState) => void = event => {
        this._formOptions?.onValidate?.({
            isValid: (Object.keys(event.fields) as Array<keyof PaypalCommerceHostedFieldsState['fields']>)
                .every(key => event.fields[key]?.isValid),
            errors: this._mapValidationErrors(event.fields),
        });
    };

}
