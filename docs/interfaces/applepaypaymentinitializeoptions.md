[@bigcommerce/checkout-sdk](../README.md) › [ApplePayPaymentInitializeOptions](applepaypaymentinitializeoptions.md)

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

## Hierarchy

* **ApplePayPaymentInitializeOptions**

## Index

### Properties

* [shippingLabel](applepaypaymentinitializeoptions.md#optional-shippinglabel)
* [subtotalLabel](applepaypaymentinitializeoptions.md#optional-subtotallabel)

## Properties

### `Optional` shippingLabel

• **shippingLabel**? : *undefined | string*

Shipping label to be passed to apple sheet.

___

### `Optional` subtotalLabel

• **subtotalLabel**? : *undefined | string*

Sub total label to be passed to apple sheet.
