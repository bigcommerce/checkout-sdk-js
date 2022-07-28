[@bigcommerce/checkout-sdk](../README.md) / ApplePayPaymentInitializeOptions_2

# Interface: ApplePayPaymentInitializeOptions\_2

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

## Table of contents

### Properties

- [shippingLabel](ApplePayPaymentInitializeOptions_2.md#shippinglabel)
- [subtotalLabel](ApplePayPaymentInitializeOptions_2.md#subtotallabel)

## Properties

### shippingLabel

• `Optional` **shippingLabel**: `string`

Shipping label to be passed to apple sheet.

___

### subtotalLabel

• `Optional` **subtotalLabel**: `string`

Sub total label to be passed to apple sheet.
