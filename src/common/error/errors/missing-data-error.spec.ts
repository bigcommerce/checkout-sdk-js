import MissingDataError, { MissingDataErrorType } from './missing-data-error';

describe ('MissingDataError', () => {
    it('shows debug message if in development', () => {
        const error = new MissingDataError(MissingDataErrorType.MissingCheckout, true);

        expect(error.message).toEqual('Unable to proceed because checkout data is unavailable.\n\nThe data could be unavailable because it has not loaded from the server yet. To fix this issue, you can try calling `CheckoutService#loadCheckout` before performing the same action again.');
    });

    it('shows plain error message if in not development', () => {
        const error = new MissingDataError(MissingDataErrorType.MissingCheckout);

        expect(error.message).toEqual('Unable to proceed because checkout data is unavailable.');
    });
});
