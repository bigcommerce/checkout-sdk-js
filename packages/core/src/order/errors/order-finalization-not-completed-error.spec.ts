import OrderFinalizationNotCompletedError from './order-finalization-not-completed-error';

describe('OrderFinalizationNotCompletedError', () => {
    let error = new OrderFinalizationNotCompletedError();

    it('returns error name', () => {
        expect(error.name).toBe('OrderFinalizationNotCompletedError');
    });

    it('returns error type', () => {
        expect(error.type).toBe('order_finalization_not_completed');
    });

    it('returns default message', () => {
        expect(error.message).toBe('The current order could not be finalized successfully');
    });

    it('returns custom message', () => {
        error = new OrderFinalizationNotCompletedError('Custom error message');

        expect(error.message).toBe('Custom error message');
    });
});
