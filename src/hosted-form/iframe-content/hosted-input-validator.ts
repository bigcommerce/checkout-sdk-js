import { cvv, expirationDate, number } from 'card-validator';
import { pick } from 'lodash';
import { object, string, StringSchema, ValidationError } from 'yup';

import HostedInputValidateErrorData from './hosted-input-validate-error-data';
import HostedInputValues from './hosted-input-values';

interface HostedInputValidateOptions {
    isCardCodeRequired?: boolean;
}

export default class HostedInputValidator {
    async validate(values: HostedInputValues, options?: HostedInputValidateOptions): Promise<HostedInputValidateErrorData[]> {
        const schemas: { [key in keyof HostedInputValues]: StringSchema } = {
            cardExpiry: this._getCardExpirySchema(),
            cardName: this._getCardNameSchema(),
            cardNumber: this._getCardNumberSchema(),
        };

        if (options && options.isCardCodeRequired) {
            schemas.cardCode = this._getCardCodeSchema();
        }

        try {
            await object(pick(schemas, Object.keys(values)))
                .validate(values, { abortEarly: false });

            return [];
        } catch (error) {
            if (error.name !== 'ValidationError') {
                throw error;
            }

            return (error as ValidationError).inner.map(innerError => ({
                fieldType: innerError.path,
                message: innerError.errors.join(' '),
            }));
        }
    }

    private _getCardCodeSchema(): StringSchema {
        return string()
            .required('CVV is required')
            .test({
                message: 'CVV must be valid',
                test(value) {
                    const { card } = number((this.parent as HostedInputValues).cardNumber);

                    return cvv(value, card && card.code ? card.code.size : undefined).isValid;
                },
            });
    }

    private _getCardExpirySchema(): StringSchema {
        return string()
            .required('Expiration date is required')
            .test({
                message: 'Expiration date must be a valid future date in MM / YY format',
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
                test: value => number(value).isValid,
            });
    }
}
