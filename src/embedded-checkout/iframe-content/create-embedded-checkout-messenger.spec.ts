import createEmbeddedCheckoutMessenger from './create-embedded-checkout-messenger';
import IframeEmbeddedCheckoutMessenger from './iframe-embedded-checkout-messenger';
import NoopEmbeddedCheckoutMessenger from './noop-embedded-checkout-messenger';

describe('createEmbeddedCheckoutMessenger()', () => {
    it('creates no-op embedded checkout messenger if not inside iframe', () => {
        expect(createEmbeddedCheckoutMessenger({ parentOrigin: 'https://foobar.mybigcommerece.com' }))
            .toBeInstanceOf(NoopEmbeddedCheckoutMessenger);
    });

    it('creates embedded checkout messenger if inside iframe', () => {
        expect(createEmbeddedCheckoutMessenger({ parentOrigin: 'https://foobar.mybigcommerece.com', parentWindow: Object.create(window) }))
            .toBeInstanceOf(IframeEmbeddedCheckoutMessenger);
    });
});
