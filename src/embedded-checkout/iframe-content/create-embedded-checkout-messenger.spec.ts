import createEmbeddedCheckoutMessenger from './create-embedded-checkout-messenger';
import EmbeddedCheckoutMessenger from './embedded-checkout-messenger';

describe('createEmbeddedCheckoutMessenger()', () => {
    it('creates embedded checkout messenger', () => {
        expect(createEmbeddedCheckoutMessenger({ parentOrigin: 'https://foobar.mybigcommerece.com' }))
            .toBeInstanceOf(EmbeddedCheckoutMessenger);
    });
});
