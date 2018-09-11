import { CurrencyConfig } from './currency';

export default class CurrencyFormatter {
    private _decimalPlaces: number;
    private _symbolLocation: string;
    private _symbol: string;
    private _thousandsSeparator: string;
    private _decimalSeparator: string;

    constructor(
        currencySettings?: CurrencyConfig | any
    ) {
        if (!currencySettings) {
            throw new Error('Currency settings missing');
        }

        const {
            decimalPlaces,
            symbolLocation,
            symbol,
            thousandsSeparator,
            decimalSeparator,
        } = currencySettings;

        if (
            typeof symbolLocation !== 'string' ||
            typeof symbol !== 'string' ||
            typeof thousandsSeparator !== 'string' ||
            typeof decimalSeparator !== 'string' ||
            typeof decimalPlaces !== 'string'
        ) {
            throw new Error('Invalid currency settings provided');
        }

        this._decimalPlaces = parseInt(decimalPlaces, 10);
        this._symbolLocation = symbolLocation;
        this._symbol = symbol;
        this._thousandsSeparator = thousandsSeparator;
        this._decimalSeparator = decimalSeparator;
    }

    format(amount?: number): string {
        if (typeof amount !== 'number') {
            throw new Error('Invalid amount provided');
        }

        const formattedNumber = this._formatNumber(amount);

        const formattedCurrency = this._formatCurrency(formattedNumber);

        return amount < 0 ?
            `-${formattedCurrency}` :
            formattedCurrency;
    }

    private _formatNumber(amount: number): string {
        const positiveAmount = Math.abs(amount);
        const [ integerAmount, decimalAmount = '' ] = positiveAmount.toString().split('.');
        const decimalPadding = Array(this._decimalPlaces).fill('0').join('');

        return [
            integerAmount.replace(/\B(?=(\d{3})+(?!\d))/g, this._thousandsSeparator),
            `${decimalAmount}${decimalPadding}`.slice(0, this._decimalPlaces),
        ].join(this._decimalSeparator);
    }

    private _formatCurrency(formattedNumber: string): string {
        return (this._symbolLocation.toLowerCase() === 'left') ?
            `${this._symbol}${formattedNumber}` :
            `${formattedNumber}${this._symbol}`;
    }
}
