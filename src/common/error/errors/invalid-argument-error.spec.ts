import InvalidArgumentError from './invalid-argument-error';

describe('InvalidArgumentError', () => {
    it('returns error name', () => {
        const error = new InvalidArgumentError();

        expect(error.name).toEqual('InvalidArgumentError');
    });
});
