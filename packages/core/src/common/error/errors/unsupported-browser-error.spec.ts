import UnsupportedBrowserError from './unsupported-browser-error';

describe('UnsupportedBrowserError', () => {
    it('returns error name', () => {
        const error = new UnsupportedBrowserError();

        expect(error.name).toEqual('UnsupportedBrowserError');
    });
});
