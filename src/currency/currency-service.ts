import { bindDecorator as bind } from '../common/utility';
import { StoreConfig } from '../config';

import CurrencyFormatter from './currency-formatter';

/**
 * Responsible for formatting and converting currencies.
 */
@bind
export default class CurrencyService {
    private _customerFormatter: CurrencyFormatter;
    private _storeFormatter: CurrencyFormatter;

    /**
     * @internal
     */
    constructor(
        private _storeConfig: StoreConfig
    ) {
        this._customerFormatter = new CurrencyFormatter(this._storeConfig.shopperCurrency);
        this._storeFormatter = new CurrencyFormatter(this._storeConfig.currency);
    }

    toCustomerCurrency(amount: number): string {
        const exchangeRate = this._storeConfig.shopperCurrency.exchangeRate;

        return this._customerFormatter.format(amount * exchangeRate);
    }

    toStoreCurrency(amount: number): string {
        return this._storeFormatter.format(amount);
    }
}
