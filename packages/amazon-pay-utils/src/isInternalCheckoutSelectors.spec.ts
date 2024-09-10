import { isInternalCheckoutSelectors } from './isInternalCheckoutSelectors';

describe('isInternalCheckoutSelectors', () => {
    const checkoutSelectorsMock: {
        cart?: unknown;
        checkout?: unknown;
        config?: unknown;
        paymentMethods?: unknown;
    } = {
        cart: {},
        checkout: {},
        config: {},
        paymentMethods: {},
    };

    it('should return false if checkoutSelectors not an object', () => {
        expect(isInternalCheckoutSelectors(undefined)).toBe(false);
    });

    it('should return false if checkoutSelectors is null', () => {
        expect(isInternalCheckoutSelectors(null)).toBe(false);
    });

    it('should return false if checkoutSelectors not contain cart', () => {
        const checkoutSelectors = { ...checkoutSelectorsMock };

        delete checkoutSelectors.cart;

        expect(isInternalCheckoutSelectors(checkoutSelectors)).toBe(false);
    });

    it('should return false if checkoutSelectors not contain checkout', () => {
        const checkoutSelectors = { ...checkoutSelectorsMock };

        delete checkoutSelectors.checkout;

        expect(isInternalCheckoutSelectors(checkoutSelectors)).toBe(false);
    });

    it('should return false if checkoutSelectors not contain config', () => {
        const checkoutSelectors = { ...checkoutSelectorsMock };

        delete checkoutSelectors.config;

        expect(isInternalCheckoutSelectors(checkoutSelectors)).toBe(false);
    });

    it('should return false if checkoutSelectors not contain paymentMethods', () => {
        const checkoutSelectors = { ...checkoutSelectorsMock };

        delete checkoutSelectors.paymentMethods;

        expect(isInternalCheckoutSelectors(checkoutSelectors)).toBe(false);
    });

    it('should return true if checkoutSelectors is InternalCheckoutSelectors', () => {
        expect(isInternalCheckoutSelectors(checkoutSelectorsMock)).toBe(true);
    });
});
