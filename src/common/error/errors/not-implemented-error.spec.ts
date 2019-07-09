import NotImplementedError from './not-implemented-error';

describe('NotImplementedError', () => {
    it('returns error name', () => {
        const error = new NotImplementedError();

        expect(error.name).toEqual('NotImplementedError');
    });
});
