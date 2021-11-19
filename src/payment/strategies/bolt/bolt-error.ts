import { StandardError } from '../../../common/error/errors';

export default class BoltError extends StandardError {

    private static getErrorMessage(errorCode: string): string | undefined {
        switch (errorCode) {
            case '1000':
            case '1001':
            case '1002':
            case '2000':
            case '2001':
            case '2002':
            case '3001':
                return 'Your card details could not be verified. Please double check them and try again.';
            case '1003':
                return 'Unable to process the payment because invalid data was supplied with the transaction.';
            case '2003':
                return 'Your billing address couldn\'t be verified. Please check your billing address details and try again.';
            case '3000':
                return 'Your card cannot be used to make this payment. Please contact your card issuer, or try using a different card.';
        }
    }

    constructor(
        public errorCode: string
    ) {
        super(BoltError.getErrorMessage(errorCode));

        this.name = 'BoltPaymentsFieldError';
        this.type = 'bolt_payments_field_error';
    }
}
