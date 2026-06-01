[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / createCurrencyService

# Function: createCurrencyService()

> **createCurrencyService**(`config`): [`CurrencyService`](../classes/CurrencyService.md)

Creates an instance of `CurrencyService`.

## Parameters

### config

[`StoreConfig`](../interfaces/StoreConfig.md)

The config object containing the currency configuration

## Returns

[`CurrencyService`](../classes/CurrencyService.md)

an instance of `CurrencyService`.

## Remarks

```js
const { data } = checkoutService.getState();
const config = data.getConfig();
const checkout = data.getCheckout();
const currencyService = createCurrencyService(config);

currencyService.toStoreCurrency(checkout.grandTotal);
currencyService.toCustomerCurrency(checkout.grandTotal);
```
