import createRequestErrorFactory from './create-request-error-factory';
import RequestErrorFactory from './request-error-factory';

describe('createRequestErrorFactory()', () => {
    it('returns an instance of RequestErrorFactory', () => {
        const factory = createRequestErrorFactory();

        expect(factory).toBeInstanceOf(RequestErrorFactory);
    });
});
