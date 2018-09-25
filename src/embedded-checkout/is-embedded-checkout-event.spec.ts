import { EmbeddedCheckoutEventType } from './embedded-checkout-events';
import isEmbeddedCheckoutEvent from './is-embedded-checkout-event';

describe('isEmbeddedCheckoutEvent()', () => {
    it('returns true if object is valid embedded checkout event', () => {
        expect(isEmbeddedCheckoutEvent({ type: EmbeddedCheckoutEventType.CheckoutLoaded }))
            .toEqual(true);
    });

    it('returns false if object is not valid embedded checkout event', () => {
        expect(isEmbeddedCheckoutEvent({ type: 'FOOBAR_EVENT' }))
            .toEqual(false);
    });
});
