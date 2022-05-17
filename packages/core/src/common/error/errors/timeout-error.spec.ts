import TimeoutError from './timeout-error';

describe('TimeoutError', () => {
    it('returns error name', () => {
        const error = new TimeoutError();

        expect(error.name).toEqual('TimeoutError');
    });
});
