[@bigcommerce/checkout-sdk](../README.md) / ApplePayButtonInitializeOptions

# Interface: ApplePayButtonInitializeOptions

A set of options that are required to initialize ApplePay in cart.

When ApplePay is initialized, an ApplePay button will be inserted into the
DOM. When a customer clicks on it, it will trigger Apple sheet.

## Table of contents

### Properties

- [buttonClassName](ApplePayButtonInitializeOptions.md#buttonclassname)
- [buyNowInitializeOptions](ApplePayButtonInitializeOptions.md#buynowinitializeoptions)
- [requiresShipping](ApplePayButtonInitializeOptions.md#requiresshipping)

### Methods

- [onPaymentAuthorize](ApplePayButtonInitializeOptions.md#onpaymentauthorize)

## Properties

### buttonClassName

• `Optional` **buttonClassName**: `string`

The class name of the ApplePay button style.

___

### buyNowInitializeOptions

• `Optional` **buyNowInitializeOptions**: `Object`

The options that are required to initialize Buy Now functionality.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `getBuyNowCartRequestBody?` | () => `void` \| `default` |

___

### requiresShipping

• `Optional` **requiresShipping**: `boolean`

This option indicates if product requires shipping

## Methods

### onPaymentAuthorize

▸ **onPaymentAuthorize**(): `void`

A callback that gets called when a payment is successfully completed.

#### Returns

`void`
