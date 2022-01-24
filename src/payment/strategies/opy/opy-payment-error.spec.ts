import OpyError from './opy-payment-error';

describe('DigitalRiverError', () => {
    it('returns error name, type and message', () => {
        const error = new OpyError('payment.opy_invalid_cart_error', 'opyInvalidCartError');

        expect(error.name).toEqual('opyInvalidCartError');
        expect(error.type).toEqual('payment.opy_invalid_cart_error');
        expect(error.message).toEqual('Unable to proceed because cart data is unavailable or payment for this order has already been made');
    });
});
