import { StandardError } from '../../../common/error/errors';

export enum OpyErrorType {
    InvalidCart = 'invalid_cart',
}
export default class OpyError extends StandardError {
    subtype: string;

    constructor(subtype: OpyErrorType, displayName: string) {
        super(getErrorMessage(subtype, displayName));

        this.name = 'OpyError';
        this.type = 'opy_error';
        this.subtype = subtype;
    }
}

function getErrorMessage(type: OpyErrorType, displayName: string): string {
    switch (type) {
        case OpyErrorType.InvalidCart:
            return `Cart price is different to ${displayName} plan amount.`;

        default:
            return 'There was an error while processing your payment. Please try again or contact us.';
    }
}
