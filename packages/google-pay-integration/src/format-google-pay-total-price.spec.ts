import formatGooglePayTotalPrice from './format-google-pay-total-price';

describe('formatGooglePayTotalPrice', () => {
    it('formats price with two decimal places', () => {
        expect(formatGooglePayTotalPrice(10, 2)).toBe('10.00');
        expect(formatGooglePayTotalPrice(10.005, 2)).toBe('10.01');
    });

    it('formats price with three decimal places', () => {
        expect(formatGooglePayTotalPrice(10.5, 3)).toBe('10.500');
        expect(formatGooglePayTotalPrice(10.1234, 3)).toBe('10.123');
    });

    it('formats price without decimal places', () => {
        expect(formatGooglePayTotalPrice(1000.4, 0)).toBe('1000');
    });
});
