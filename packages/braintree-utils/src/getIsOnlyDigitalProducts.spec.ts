import getIsOnlyDigitalProducts from './getIsOnlyDigitalProducts';
import { getCartMockWithDigitalItemsOnly } from './mocks';

describe('getIsOnlyDigitalProducts', () => {
    it('Should return true for digital products', () => {
        const cart = getCartMockWithDigitalItemsOnly();
        const isOnlyDigitalProducts = getIsOnlyDigitalProducts(cart);
        expect(isOnlyDigitalProducts).toBe(true);
    });
});
