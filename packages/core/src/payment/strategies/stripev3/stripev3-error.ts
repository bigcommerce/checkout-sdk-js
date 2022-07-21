import { StandardError } from '../../../common/error/errors';

const defaultMessage = 'There was an error while processing your payment. Please try again or contact us.';

export enum StripeV3ErrorType {
    AuthFailure = 'auth-failure',
}

export default class StripeV3Error extends StandardError {
    constructor(type: StripeV3ErrorType) {
        super(getErrorMessage(type) || defaultMessage);

        this.type = type;
    }
}

function getErrorMessage(type: StripeV3ErrorType){
    switch (type) {
        case StripeV3ErrorType.AuthFailure:
            return `User did not authenticate`;
        default:
            return 'There was an error while processing your payment. Please try again or contact us.';
    }
}
