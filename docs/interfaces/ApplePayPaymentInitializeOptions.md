[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / ApplePayPaymentInitializeOptions

# Interface: ApplePayPaymentInitializeOptions

A set of options that are required to initialize the Applepay payment method with:

1) ApplePay:

```js
service.initializePayment({
    methodId: 'applepay',
    applepay: {
        shippingLabel: 'Shipping',
        subtotalLabel: 'Sub total',
    }
});
```

## Properties

### shippingLabel?

> `optional` **shippingLabel?**: `string`

Shipping label to be passed to apple sheet.

***

### storeCreditLabel?

> `optional` **storeCreditLabel?**: `string`

Store credit label to be passed to apple sheet.

***

### subtotalLabel?

> `optional` **subtotalLabel?**: `string`

Sub total label to be passed to apple sheet.
