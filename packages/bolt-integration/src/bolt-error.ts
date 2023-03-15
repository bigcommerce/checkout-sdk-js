import { PaymentErrorData, StandardError } from '@bigcommerce/checkout-sdk/payment-integration-api';

export default class BoltError extends StandardError {
    body: { errors: PaymentErrorData[] };

    constructor(public errorCode: string) {
        super();

        this.name = 'BoltPaymentsFieldError';
        this.type = 'bolt_payments_field_error';
        this.body = { errors: [BoltError.getError(errorCode)] };
    }

    private static getError(errorCode: string): PaymentErrorData {
        switch (errorCode) {
            case '1000':
            case '2000':
            case '3000':
                return { code: 'invalid_number' };

            case '1001':
            case '2001':
            case '3001':
                return { code: 'invalid_expiry_date' };

            case '1002':
            case '2002':
                return { code: 'invalid_cvc' };

            case '1003':
                return { code: 'invalid_zip' };

            case '2003':
                return { code: 'incorrect_zip' };

            default:
                return { code: 'general_error' };
        }
    }
}
