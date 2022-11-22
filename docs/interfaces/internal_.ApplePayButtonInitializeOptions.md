[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / ApplePayButtonInitializeOptions

# Interface: ApplePayButtonInitializeOptions

[<internal>](../modules/internal_.md).ApplePayButtonInitializeOptions

A set of options that are required to initialize ApplePay in cart.

When ApplePay is initialized, an ApplePay button will be inserted into the
DOM. When a customer clicks on it, it will trigger Apple sheet.

## Table of contents

### Properties

- [buttonClassName](internal_.ApplePayButtonInitializeOptions.md#buttonclassname)

### Methods

- [onPaymentAuthorize](internal_.ApplePayButtonInitializeOptions.md#onpaymentauthorize)

## Properties

### buttonClassName

• `Optional` **buttonClassName**: `string`

The class name of the ApplePay button style.

## Methods

### onPaymentAuthorize

▸ **onPaymentAuthorize**(): `void`

A callback that gets called when a payment is successfully completed.

#### Returns

`void`
