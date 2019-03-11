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
                expect(currencyFormatter.format(0)).toEqual('$0');
                expect(currencyFormatter.format(10)).toEqual('$10');
                expect(currencyFormatter.format(100.100)).toEqual('$100');
                expect(currencyFormatter.format(999888777.666555)).toEqual('$999,888,778');
                expect(currencyFormatter.format(99888777.666555)).toEqual('$99,888,778');
                expect(currencyFormatter.format(9888777.666555)).toEqual('$9,888,778');
                expect(currencyFormatter.format(888777.666555)).toEqual('$888,778');
            });

            it('returns formatted negative number', () => {
                expect(currencyFormatter.format(-0)).toEqual('$0');
                expect(currencyFormatter.format(-10)).toEqual('-$10');
                expect(currencyFormatter.format(-100.100)).toEqual('-$100');
                expect(currencyFormatter.format(-999888777.666555)).toEqual('-$999,888,778');
                expect(currencyFormatter.format(-99888777.666555)).toEqual('-$99,888,778');
                expect(currencyFormatter.format(-9888777.666555)).toEqual('-$9,888,778');
                expect(currencyFormatter.format(-888777.666555)).toEqual('-$888,778');
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
                expect(currencyFormatter.format(0)).toEqual('$0.00');
                expect(currencyFormatter.format(10)).toEqual('$10.00');
                expect(currencyFormatter.format(100.100)).toEqual('$100.10');
                expect(currencyFormatter.format(859.385)).toEqual('$859.39');
                expect(currencyFormatter.format(999888777.666555)).toEqual('$999,888,777.67');
                expect(currencyFormatter.format(99888777.666555)).toEqual('$99,888,777.67');
                expect(currencyFormatter.format(9888777.666555)).toEqual('$9,888,777.67');
                expect(currencyFormatter.format(888777.666555)).toEqual('$888,777.67');
            });

            it('returns formatted negative number', () => {
                expect(currencyFormatter.format(-0)).toEqual('$0.00');
                expect(currencyFormatter.format(-10)).toEqual('-$10.00');
                expect(currencyFormatter.format(-100.100)).toEqual('-$100.10');
                expect(currencyFormatter.format(-999888777.666555)).toEqual('-$999,888,777.67');
                expect(currencyFormatter.format(-99888777.666555)).toEqual('-$99,888,777.67');
                expect(currencyFormatter.format(-9888777.666555)).toEqual('-$9,888,777.67');
                expect(currencyFormatter.format(-888777.664444)).toEqual('-$888,777.66');
            });

            it('adds padding with 0s', () => {
                expect(currencyFormatter.format(0.9)).toEqual('$0.90');
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
                expect(currencyFormatter.format(0)).toEqual('0;000@');
                expect(currencyFormatter.format(10)).toEqual('10;000@');
                expect(currencyFormatter.format(100.100)).toEqual('100;100@');
                expect(currencyFormatter.format(999888777.12345)).toEqual('999 888 777;123@');
                expect(currencyFormatter.format(99888777.12345)).toEqual('99 888 777;123@');
                expect(currencyFormatter.format(9888777.12345)).toEqual('9 888 777;123@');
                expect(currencyFormatter.format(888777.12345)).toEqual('888 777;123@');
            });

            it('returns formatted negative number', () => {
                expect(currencyFormatter.format(-0)).toEqual('0;000@');
                expect(currencyFormatter.format(-10)).toEqual('-10;000@');
                expect(currencyFormatter.format(-100.100)).toEqual('-100;100@');
                expect(currencyFormatter.format(-999888777.12345)).toEqual('-999 888 777;123@');
                expect(currencyFormatter.format(-99888777.12345)).toEqual('-99 888 777;123@');
                expect(currencyFormatter.format(-9888777.12345)).toEqual('-9 888 777;123@');
                expect(currencyFormatter.format(-888777.12345)).toEqual('-888 777;123@');
            });

            it('adds padding with 0s', () => {
                expect(currencyFormatter.format(-0.9)).toEqual('-0;900@');
            });
        });
    });
});
