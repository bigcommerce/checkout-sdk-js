import PaymentExecuteError from './payment-execute-error';

describe('ExecuteError', () => {
    it('returns error name, type and message', () => {
        const error = new PaymentExecuteError(
            'payment.humm_not_processable_error',
            'hummNotProcessableError',
            'Humm cannot process your payment for this order, please select another payment method.'
        );

        expect(error.name).toEqual('hummNotProcessableError');
        expect(error.type).toEqual('custom_provider_execute_error');
        expect(error.subtype).toEqual('payment.humm_not_processable_error');
        expect(error.message).toEqual('Humm cannot process your payment for this order, please select another payment method.');
    });
});
