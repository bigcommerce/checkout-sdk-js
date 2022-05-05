import NotEmbeddableError from './not-embeddable-error';

describe('NotEmbeddableError', () => {
    it('returns error name', () => {
        const error = new NotEmbeddableError();

        expect(error.name).toEqual('NotEmbeddableError');
    });
});
