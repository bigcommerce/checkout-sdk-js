import { isStripePaymentEvent } from './is-stripe-payment-event';

describe('isStripePaymentEvent', () => {
    it('should return false if event undefined', () => {
        expect(isStripePaymentEvent(undefined)).toBe(false);
    });

    it('should return false if event null', () => {
        expect(isStripePaymentEvent(null)).toBe(false);
    });

    it('should return false if event does not have value property', () => {
        const eventMock = {
            collapsed: false,
        };

        expect(isStripePaymentEvent(eventMock)).toBe(false);
    });

    it('should return false if event does not have collapsed property', () => {
        const eventMock = {
            value: {},
        };

        expect(isStripePaymentEvent(eventMock)).toBe(false);
    });

    it('should return true if event is StripePaymentEvent', () => {
        const eventMock = {
            collapsed: false,
            value: {},
        };

        expect(isStripePaymentEvent(eventMock)).toBe(true);
    });
});
