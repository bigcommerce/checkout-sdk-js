import OpyError, { OpyErrorType } from './opy-payment-error';

describe('OpyError', () => {
    it('returns error name, type, subtype and message', () => {
        const error = new OpyError(OpyErrorType.InvalidCart, 'Foo Payment Method');

        expect(error.name).toBe('OpyError');
        expect(error.type).toBe('opy_error');
        expect(error.subtype).toBe('invalid_cart');
        expect(error.message).toBe('Cart price is different to Foo Payment Method plan amount.');
    });
});
