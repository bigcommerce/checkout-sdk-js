[@bigcommerce/checkout-sdk](../README.md) / PaypalCommerceButtonInitializeOptions

# Interface: PaypalCommerceButtonInitializeOptions

## Table of contents

### Properties

- [buyNowInitializeOptions](PaypalCommerceButtonInitializeOptions.md#buynowinitializeoptions)
- [currencyCode](PaypalCommerceButtonInitializeOptions.md#currencycode)
- [initializesOnCheckoutPage](PaypalCommerceButtonInitializeOptions.md#initializesoncheckoutpage)
- [style](PaypalCommerceButtonInitializeOptions.md#style)

### Methods

- [onComplete](PaypalCommerceButtonInitializeOptions.md#oncomplete)

## Properties

### buyNowInitializeOptions

• `Optional` **buyNowInitializeOptions**: `Object`

The options that are required to initialize Buy Now functionality.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `getBuyNowCartRequestBody?` | () => `void` \| [`BuyNowCartRequestBody`](BuyNowCartRequestBody.md) |

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

• `Optional` **style**: [`PaypalButtonStyleOptions_2`](PaypalButtonStyleOptions_2.md)

A set of styling options for the checkout button.

## Methods

### onComplete

▸ `Optional` **onComplete**(): `void`

A callback that gets called when payment complete on paypal side.

#### Returns

`void`
