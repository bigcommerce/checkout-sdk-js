import { InvalidArgumentError } from '../common/error/errors';

import { CurrencyConfig } from './currency';

export default class CurrencyFormatter {
    private _decimalPlaces: number;
    private _symbolLocation: string;
    private _symbol: string;
    private _thousandsSeparator: string;
    private _decimalSeparator: string;

    constructor(
        currencySettings: CurrencyConfig
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
            throw new InvalidArgumentError('Invalid currency settings provided');
        }

        this._decimalPlaces = parseInt(decimalPlaces, 10);
        this._symbolLocation = symbolLocation;
        this._symbol = symbol;
        this._thousandsSeparator = thousandsSeparator;
        this._decimalSeparator = decimalSeparator;
    }

    format(amount?: number): string {
        if (typeof amount !== 'number') {
            throw new InvalidArgumentError('Invalid amount provided');
        }

        const formattedNumber = this._formatNumber(amount);

        const formattedCurrency = this._formatCurrency(formattedNumber);

        return amount < 0 ?
            `-${formattedCurrency}` :
            formattedCurrency;
    }

    private _formatNumber(amount: number): string {
        const positiveAmount = Math.abs(amount);
        const [ integerAmount, decimalAmount = '' ] = (this._toFixed(positiveAmount, this._decimalPlaces)).split('.');
        const parsedIntegerAmount = integerAmount.replace(/\B(?=(\d{3})+(?!\d))/g, this._thousandsSeparator);

        if (this._decimalPlaces < 1) {
            return parsedIntegerAmount;
        }

        return [
            parsedIntegerAmount,
            decimalAmount,
        ].join(this._decimalSeparator);
    }

    private _formatCurrency(formattedNumber: string): string {
        return (this._symbolLocation.toLowerCase() === 'left') ?
            `${this._symbol}${formattedNumber}` :
            `${formattedNumber}${this._symbol}`;
    }

    private _toFixed(value: number, precision: number): string {
        return (+(Math.round(+(value + 'e' + precision)) + 'e' + -precision)).toFixed(precision);
    }
}
