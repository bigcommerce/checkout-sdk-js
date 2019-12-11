import { cvv, expirationDate, number } from 'card-validator';
import { getTypeInfo } from 'credit-card-type';
import { includes } from 'lodash';
import { object, string, StringSchema, ValidationError } from 'yup';

import { CardInstrument } from '../../payment/instrument';
import HostedFieldType from '../hosted-field-type';

import { HostedInputValidateErrorDataMap } from './hosted-input-validate-error-data';
import HostedInputValidateResults from './hosted-input-validate-results';
import HostedInputValues from './hosted-input-values';

export default class HostedInputValidator {
    constructor(
        private _cardInstrument?: CardInstrument
    ) {}

    async validate(values: HostedInputValues): Promise<HostedInputValidateResults> {
        const requiredFields = Object.keys(values);
        const schemas: { [key in keyof HostedInputValues]: StringSchema } = {};
        const results: HostedInputValidateResults = {
            errors: {},
            isValid: true,
        };

        if (includes(requiredFields, HostedFieldType.CardCode)) {
            schemas.cardCode = this._getCardCodeSchema();
            results.errors.cardCode = [];
        }

        if (includes(requiredFields, HostedFieldType.CardCodeVerification)) {
            schemas.cardCodeVerification = this._getCardCodeVerificationSchema();
            results.errors.cardCodeVerification = [];
        }

        if (includes(requiredFields, HostedFieldType.CardExpiry)) {
            schemas.cardExpiry = this._getCardExpirySchema();
            results.errors.cardExpiry = [];
        }

        if (includes(requiredFields, HostedFieldType.CardName)) {
            schemas.cardName = this._getCardNameSchema();
            results.errors.cardName = [];
        }

        if (includes(requiredFields, HostedFieldType.CardNumber)) {
            schemas.cardNumber = this._getCardNumberSchema();
            results.errors.cardNumber = [];
        }

        if (includes(requiredFields, HostedFieldType.CardNumberVerification)) {
            schemas.cardNumberVerification = this._getCardNumberVerificationSchema();
            results.errors.cardNumberVerification = [];
        }

        try {
            await object(schemas)
                .validate(values, { abortEarly: false });

            return results;
        } catch (error) {
            if (error.name !== 'ValidationError') {
                throw error;
            }

            return {
                errors: (Object.keys(results.errors) as Array<keyof HostedInputValidateErrorDataMap>)
                    .reduce((result, fieldType) => ({
                        ...result,
                        [fieldType]: (error as ValidationError).inner
                            .filter(innerError => innerError.path === fieldType)
                            .map(innerError => ({
                                fieldType: innerError.path,
                                message: innerError.errors.join(' '),
                                type: innerError.type,
                            })),
                    }), {} as HostedInputValidateErrorDataMap),
                isValid: false,
            };
        }
    }

    private _getCardCodeSchema(): StringSchema {
        return string()
            .required('CVV is required')
            .test({
                message: 'CVV must be valid',
                name: 'invalid_card_code',
                test(value) {
                    const { card } = number((this.parent as HostedInputValues).cardNumber || '');

                    return cvv(value, card && card.code ? card.code.size : undefined).isValid;
                },
            });
    }

    private _getCardCodeVerificationSchema(): StringSchema {
        return string()
            .required('CVV is required')
            .test({
                message: 'CVV must be valid',
                name: 'invalid_card_code',
                test: (value = '') => {
                    const cardType = this._cardInstrument && this._mapFromInstrumentCardType(this._cardInstrument.brand);
                    const cardInfo = cardType && getTypeInfo(cardType);

                    return cvv(value, cardInfo && cardInfo.code ? cardInfo.code.size : undefined).isValid;
                },
            });
    }

    private _getCardExpirySchema(): StringSchema {
        return string()
            .required('Expiration date is required')
            .test({
                message: 'Expiration date must be a valid future date in MM / YY format',
                name: 'invalid_card_expiry',
                test: value => expirationDate(value).isValid,
            });
    }

    private _getCardNameSchema(): StringSchema {
        return string()
            .max(200)
            .required('Full name is required');
    }

    private _getCardNumberSchema(): StringSchema {
        return string()
            .required('Credit card number is required')
            .test({
                message: 'Credit card number must be valid',
                name: 'invalid_card_number',
                test: value => number(value).isValid,
            });
    }

    private _getCardNumberVerificationSchema(): StringSchema {
        return string()
            .required('Credit card number is required')
            .test({
                message: 'Credit card number must be valid',
                name: 'invalid_card_number',
                test: (value = '') => number(value).isValid,
            })
            .test({
                message: 'The card number entered does not match the card stored in your account',
                name: 'mismatched_card_number',
                test: (value = '') => this._cardInstrument ?
                    value.slice(-this._cardInstrument.last4.length) === this._cardInstrument.last4 :
                    false,
            });
    }

    private _mapFromInstrumentCardType(type: string): string {
        switch (type) {
        case 'amex':
        case 'american_express':
            return 'american-express';

        case 'diners':
            return 'diners-club';

        default:
            return type;
        }
    }
}
