[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / createCheckoutService

# Function: createCheckoutService()

> **createCheckoutService**(`options?`): [`CheckoutService`](../classes/CheckoutService.md)

Creates an instance of `CheckoutService`.

## Parameters

### options?

[`CheckoutServiceOptions`](../interfaces/CheckoutServiceOptions.md)

A set of construction options.

## Returns

[`CheckoutService`](../classes/CheckoutService.md)

an instance of `CheckoutService`.

## Remarks

```js
const service = createCheckoutService();

service.subscribe(state => {
    console.log(state);
});

service.loadCheckout();
```
