[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / createCheckoutButtonInitializer

# Function: createCheckoutButtonInitializer()

> **createCheckoutButtonInitializer**(`options?`): [`CheckoutButtonInitializer`](../classes/CheckoutButtonInitializer.md)

**`Alpha`**

Creates an instance of `CheckoutButtonInitializer`.

## Parameters

### options?

[`CheckoutButtonInitializerOptions`](../interfaces/CheckoutButtonInitializerOptions.md)

A set of construction options.

## Returns

[`CheckoutButtonInitializer`](../classes/CheckoutButtonInitializer.md)

an instance of `CheckoutButtonInitializer`.

## Remarks

```js
const initializer = createCheckoutButtonInitializer();

initializer.initializeButton({
    methodId: 'braintreepaypal',
    braintreepaypal: {
        container: '#checkoutButton',
    },
});
```

Please note that `CheckoutButtonInitializer` is currently in an early stage
of development. Therefore the API is unstable and not ready for public
consumption.
