import NotInitializedError, { NotInitializedErrorType } from './not-initialized-error';

describe('NotInitializedError', () => {
    it('returns error name', () => {
        const error = new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);

        expect(error.name).toEqual('NotInitializedError');
    });
});
