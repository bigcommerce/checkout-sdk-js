import OrderFinalizationNotCompletedError from './order-finalization-not-completed-error';

describe('OrderFinalizationNotCompletedError', () => {
    let error = new OrderFinalizationNotCompletedError();

    it('returns error name', () => {
        expect(error.name).toEqual('OrderFinalizationNotCompletedError');
    });

    it('returns error type', () => {
        expect(error.type).toEqual('order_finalization_not_completed');
    });

    it('returns default message', () => {
        expect(error.message).toEqual('The current order could not be finalized successfully');
    });

    it('returns custom message', () => {
        error = new OrderFinalizationNotCompletedError('Custom error message');

        expect(error.message).toEqual('Custom error message');
    });
});
