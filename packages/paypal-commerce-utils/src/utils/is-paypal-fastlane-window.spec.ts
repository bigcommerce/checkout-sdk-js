import { PayPalCommerceHostWindow } from '../paypal-commerce-types';

import isPayPalFastlaneWindow from './is-paypal-fastline-window';

describe('isPayPalFastlaneWindow', () => {
    it('window has paypalFastlane option', () => {
        expect(isPayPalFastlaneWindow({ paypalFastlane: {} } as PayPalCommerceHostWindow)).toBe(
            true,
        );
    });

    it('window does not have paypalFastlane option', () => {
        expect(isPayPalFastlaneWindow({} as Window)).toBe(false);
    });
});
