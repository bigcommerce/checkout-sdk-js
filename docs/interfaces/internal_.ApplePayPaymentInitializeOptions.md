[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / ApplePayPaymentInitializeOptions

# Interface: ApplePayPaymentInitializeOptions

[<internal>](../modules/internal_.md).ApplePayPaymentInitializeOptions

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

- [shippingLabel](internal_.ApplePayPaymentInitializeOptions.md#shippinglabel)
- [subtotalLabel](internal_.ApplePayPaymentInitializeOptions.md#subtotallabel)

## Properties

### shippingLabel

• `Optional` **shippingLabel**: `string`

Shipping label to be passed to apple sheet.

___

### subtotalLabel

• `Optional` **subtotalLabel**: `string`

Sub total label to be passed to apple sheet.
