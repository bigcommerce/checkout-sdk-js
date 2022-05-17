import MissingDataError, { MissingDataErrorType } from './missing-data-error';

describe('MissingDataError', () => {
    it('returns error name', () => {
        const error = new MissingDataError(MissingDataErrorType.MissingCheckout);

        expect(error.name).toEqual('MissingDataError');
    });
});
