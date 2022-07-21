import StripeV3Error, { StripeV3ErrorType } from './stripev3-error';

describe('StripeV3Error', () => {
    it('returns error name, type and message', () => {
        const error = new StripeV3Error(StripeV3ErrorType.AuthFailure);

        expect(error.type).toEqual('User did not authenticate');
    });
});
