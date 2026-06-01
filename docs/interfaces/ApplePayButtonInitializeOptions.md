[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / ApplePayButtonInitializeOptions

# Interface: ApplePayButtonInitializeOptions

A set of options that are required to initialize ApplePay in cart.

When ApplePay is initialized, an ApplePay button will be inserted into the
DOM. When a customer clicks on it, it will trigger Apple sheet.

## Properties

### buyNowInitializeOptions?

> `optional` **buyNowInitializeOptions?**: `object`

The options that are required to initialize Buy Now functionality.

#### getBuyNowCartRequestBody()?

> `optional` **getBuyNowCartRequestBody**(): `void` \| `BuyNowCartRequestBody`

##### Returns

`void` \| `BuyNowCartRequestBody`

***

### requiresShipping?

> `optional` **requiresShipping?**: `boolean`

This option indicates if product requires shipping

## Methods

### onPaymentAuthorize()

> **onPaymentAuthorize**(): `void`

A callback that gets called when a payment is successfully completed.

#### Returns

`void`
