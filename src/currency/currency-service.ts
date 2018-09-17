import { Config } from '../config';

import CurrencyFormatter from './currency-formatter';

/**
 * Responsible for formatting and converting currencies.
 */
export default class CurrencyService {
    private _customerFormatter: CurrencyFormatter;
    private _storeFormatter: CurrencyFormatter;

    /**
     * @internal
     */
    constructor(
        private _config: Config
    ) {
        this._customerFormatter = new CurrencyFormatter(this._config.storeConfig.shopperCurrency);
        this._storeFormatter = new CurrencyFormatter(this._config.storeConfig.currency);
    }

    toCustomerCurrency(amount: number): string {
        const exchangeRate = parseFloat(this._config.storeConfig.shopperCurrency.exchangeRate);
        return this._customerFormatter.format(amount * exchangeRate);
    }

    toStoreCurrency(amount: number): string {
        return this._storeFormatter.format(amount);
    }
}
