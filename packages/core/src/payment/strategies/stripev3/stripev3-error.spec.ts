import StripeV3Error, { StripeV3ErrorType } from './stripev3-error';

describe('StripeV3Error', () => {
    it('returns the error type and subtype asigned in this class', () => {
        const error = new StripeV3Error(StripeV3ErrorType.AuthFailure);

        expect(error.type).toEqual('stripev3_error');
        expect(error.subtype).toEqual('auth_failure');
    });
});
