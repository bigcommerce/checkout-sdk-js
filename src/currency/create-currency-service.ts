import { StoreConfig } from '../config';

import CurrencyService from './currency-service';

/**
 * Creates an instance of `CurrencyService`.
 *
 * @remarks
 * ```js
 * const { data } = checkoutService.getState();
 * const config = data.getConfig();
 * const checkout = data.getCheckout();
 * const currencyService = createCurrencyService(config);
 *
 * currencyService.toStoreCurrency(checkout.grandTotal);
 * currencyService.toCustomerCurrency(checkout.grandTotal);
 * ```
 *
 * @alpha
 * Please note that `CurrencyService` is currently in an early stage
 * of development. Therefore the API is unstable and not ready for public
 * consumption.
 *
 * @param config - The config object containing the currency configuration
 * @returns an instance of `CurrencyService`.
 */
export default function createCurrencyService(
    config: StoreConfig
): CurrencyService {
    return new CurrencyService(config);
}
