import PaymentExecuteError from './payment-execute-error';

describe('ExecuteError', () => {
    it('returns error name, type and message', () => {
        const error = new PaymentExecuteError(
            'payment.humm_not_processable_error',
            'hummNotProcessableError',
            'Humm cannot process your payment for this order, please select another payment method.',
        );

        expect(error.name).toBe('hummNotProcessableError');
        expect(error.type).toBe('custom_provider_execute_error');
        expect(error.subtype).toBe('payment.humm_not_processable_error');
        expect(error.message).toBe(
            'Humm cannot process your payment for this order, please select another payment method.',
        );
    });
});
