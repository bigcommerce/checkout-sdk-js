import NotInitializedError, { NotInitializedErrorType } from './not-initialized-error';

describe('NotInitializedError', () => {
    it('shows debug message if in development', () => {
        const error = new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized, true);

        expect(error.message).toEqual('Unable to proceed because the payment step of checkout has not been initialized.\n\nIn order to initialize the payment step of checkout, you need to call `CheckoutService#initializePayment`. Afterwards, you should be able to submit payment details.');
    });

    it('shows plain error message if in not development', () => {
        const error = new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);

        expect(error.message).toEqual('Unable to proceed because the payment step of checkout has not been initialized.');
    });
});
