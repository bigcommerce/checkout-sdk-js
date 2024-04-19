import CurrencyFormatter from './currency-formatter';

describe('CurrencyFormater', () => {
    let currencyFormatter: CurrencyFormatter;

    describe('#format()', () => {
        describe('when no decimal places', () => {
            beforeEach(() => {
                currencyFormatter = new CurrencyFormatter({
                    decimalPlaces: '0',
                    decimalSeparator: '.',
                    symbolLocation: 'left',
                    symbol: '$',
                    thousandsSeparator: ',',
                });
            });

            it('throws error when no amount is provided', () => {
                expect(() => currencyFormatter.format()).toThrow();
            });

            it('returns formatted positive numbers', () => {
                expect(currencyFormatter.format(0)).toBe('$0');
                expect(currencyFormatter.format(10)).toBe('$10');
                expect(currencyFormatter.format(100.1)).toBe('$100');
                expect(currencyFormatter.format(999888777.666555)).toBe('$999,888,778');
                expect(currencyFormatter.format(99888777.666555)).toBe('$99,888,778');
                expect(currencyFormatter.format(9888777.666555)).toBe('$9,888,778');
                expect(currencyFormatter.format(888777.666555)).toBe('$888,778');
            });

            it('returns formatted negative number', () => {
                expect(currencyFormatter.format(-0)).toBe('$0');
                expect(currencyFormatter.format(-10)).toBe('-$10');
                expect(currencyFormatter.format(-100.1)).toBe('-$100');
                expect(currencyFormatter.format(-999888777.666555)).toBe('-$999,888,778');
                expect(currencyFormatter.format(-99888777.666555)).toBe('-$99,888,778');
                expect(currencyFormatter.format(-9888777.666555)).toBe('-$9,888,778');
                expect(currencyFormatter.format(-888777.666555)).toBe('-$888,778');
            });
        });

        describe('when regular config is provided', () => {
            beforeEach(() => {
                currencyFormatter = new CurrencyFormatter({
                    decimalPlaces: '2',
                    decimalSeparator: '.',
                    symbolLocation: 'left',
                    symbol: '$',
                    thousandsSeparator: ',',
                });
            });

            it('throws error when no amount is provided', () => {
                expect(() => currencyFormatter.format()).toThrow();
            });

            it('returns formatted positive numbers', () => {
                expect(currencyFormatter.format(0)).toBe('$0.00');
                expect(currencyFormatter.format(10)).toBe('$10.00');
                expect(currencyFormatter.format(100.1)).toBe('$100.10');
                expect(currencyFormatter.format(859.385)).toBe('$859.39');
                expect(currencyFormatter.format(999888777.666555)).toBe('$999,888,777.67');
                expect(currencyFormatter.format(99888777.666555)).toBe('$99,888,777.67');
                expect(currencyFormatter.format(9888777.666555)).toBe('$9,888,777.67');
                expect(currencyFormatter.format(888777.666555)).toBe('$888,777.67');
            });

            it('returns formatted negative number', () => {
                expect(currencyFormatter.format(-0)).toBe('$0.00');
                expect(currencyFormatter.format(-10)).toBe('-$10.00');
                expect(currencyFormatter.format(-100.1)).toBe('-$100.10');
                expect(currencyFormatter.format(-999888777.666555)).toBe('-$999,888,777.67');
                expect(currencyFormatter.format(-99888777.666555)).toBe('-$99,888,777.67');
                expect(currencyFormatter.format(-9888777.666555)).toBe('-$9,888,777.67');
                expect(currencyFormatter.format(-888777.664444)).toBe('-$888,777.66');
            });

            it('adds padding with 0s', () => {
                expect(currencyFormatter.format(0.9)).toBe('$0.90');
            });
        });

        describe('when specific config is provided', () => {
            beforeEach(() => {
                currencyFormatter = new CurrencyFormatter({
                    decimalPlaces: '3',
                    decimalSeparator: ';',
                    symbolLocation: 'right',
                    symbol: '@',
                    thousandsSeparator: ' ',
                });
            });

            it('returns formatted positive numbers', () => {
                expect(currencyFormatter.format(0)).toBe('0;000@');
                expect(currencyFormatter.format(10)).toBe('10;000@');
                expect(currencyFormatter.format(100.1)).toBe('100;100@');
                expect(currencyFormatter.format(999888777.12345)).toBe('999 888 777;123@');
                expect(currencyFormatter.format(99888777.12345)).toBe('99 888 777;123@');
                expect(currencyFormatter.format(9888777.12345)).toBe('9 888 777;123@');
                expect(currencyFormatter.format(888777.12345)).toBe('888 777;123@');
            });

            it('returns formatted negative number', () => {
                expect(currencyFormatter.format(-0)).toBe('0;000@');
                expect(currencyFormatter.format(-10)).toBe('-10;000@');
                expect(currencyFormatter.format(-100.1)).toBe('-100;100@');
                expect(currencyFormatter.format(-999888777.12345)).toBe('-999 888 777;123@');
                expect(currencyFormatter.format(-99888777.12345)).toBe('-99 888 777;123@');
                expect(currencyFormatter.format(-9888777.12345)).toBe('-9 888 777;123@');
                expect(currencyFormatter.format(-888777.12345)).toBe('-888 777;123@');
            });

            it('adds padding with 0s', () => {
                expect(currencyFormatter.format(-0.9)).toBe('-0;900@');
            });
        });
    });
});
