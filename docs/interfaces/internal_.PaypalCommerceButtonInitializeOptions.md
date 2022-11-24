[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / PaypalCommerceButtonInitializeOptions

# Interface: PaypalCommerceButtonInitializeOptions

[<internal>](../modules/internal_.md).PaypalCommerceButtonInitializeOptions

## Table of contents

### Properties

- [buyNowInitializeOptions](internal_.PaypalCommerceButtonInitializeOptions.md#buynowinitializeoptions)
- [currencyCode](internal_.PaypalCommerceButtonInitializeOptions.md#currencycode)
- [initializesOnCheckoutPage](internal_.PaypalCommerceButtonInitializeOptions.md#initializesoncheckoutpage)
- [style](internal_.PaypalCommerceButtonInitializeOptions.md#style)

### Methods

- [onComplete](internal_.PaypalCommerceButtonInitializeOptions.md#oncomplete)

## Properties

### buyNowInitializeOptions

• `Optional` **buyNowInitializeOptions**: `Object`

The options that are required to initialize Buy Now functionality.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `getBuyNowCartRequestBody?` | () => `void` \| [`BuyNowCartRequestBody`](internal_.BuyNowCartRequestBody.md) |

___

### currencyCode

• `Optional` **currencyCode**: `string`

The option that used to initialize a PayPal script with provided currency code.

___

### initializesOnCheckoutPage

• `Optional` **initializesOnCheckoutPage**: `boolean`

Flag which helps to detect that the strategy initializes on Checkout page.

___

### style

• `Optional` **style**: [`PaypalButtonStyleOptions_2`](internal_.PaypalButtonStyleOptions_2.md)

A set of styling options for the checkout button.

## Methods

### onComplete

▸ `Optional` **onComplete**(): `void`

A callback that gets called when payment complete on paypal side.

#### Returns

`void`
