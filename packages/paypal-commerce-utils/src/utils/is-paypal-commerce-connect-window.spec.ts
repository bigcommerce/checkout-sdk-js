import { PayPalCommerceHostWindow } from '../paypal-commerce-types';

import isPayPalCommerceConnectWindow from './is-paypal-commerce-connect-window';

describe('isPayPalCommerceConnectWindow', () => {
    it('window has paypalConnect option', () => {
        expect(
            isPayPalCommerceConnectWindow({ paypalConnect: {} } as PayPalCommerceHostWindow),
        ).toBe(true);
    });

    it('window does not have paypalConnect option', () => {
        expect(isPayPalCommerceConnectWindow({} as Window)).toBe(false);
    });
});
