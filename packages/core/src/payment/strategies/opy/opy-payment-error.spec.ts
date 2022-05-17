import OpyError, { OpyErrorType } from './opy-payment-error';

describe('OpyError', () => {
    it('returns error name, type, subtype and message', () => {
        const error = new OpyError(OpyErrorType.InvalidCart, 'Foo Payment Method');

        expect(error.name).toEqual('OpyError');
        expect(error.type).toEqual('opy_error');
        expect(error.subtype).toEqual('invalid_cart');
        expect(error.message).toEqual('Cart price is different to Foo Payment Method plan amount.');
    });
});
