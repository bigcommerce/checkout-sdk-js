[@bigcommerce/checkout-sdk](../README.md) / PayPalCommerceButtonInitializeOptions

# Interface: PayPalCommerceButtonInitializeOptions

A set of options that are required to initialize PayPalCommerce in cart or product details page.

When PayPalCommerce is initialized, an PayPalCommerce button will be inserted into the
DOM. When a customer clicks on it, it will trigger Apple sheet.

## Table of contents

### Properties

- [buyNowInitializeOptions](PayPalCommerceButtonInitializeOptions.md#buynowinitializeoptions)
- [currencyCode](PayPalCommerceButtonInitializeOptions.md#currencycode)
- [initializesOnCheckoutPage](PayPalCommerceButtonInitializeOptions.md#initializesoncheckoutpage)
- [style](PayPalCommerceButtonInitializeOptions.md#style)

### Methods

- [onComplete](PayPalCommerceButtonInitializeOptions.md#oncomplete)

## Properties

### buyNowInitializeOptions

• `Optional` **buyNowInitializeOptions**: `Object`

The options that are required to initialize Buy Now functionality.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `getBuyNowCartRequestBody?` | () => `void` \| `default` |

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

• `Optional` **style**: [`PayPalButtonStyleOptions`](PayPalButtonStyleOptions.md)

A set of styling options for the checkout button.

## Methods

### onComplete

▸ `Optional` **onComplete**(): `void`

A callback that gets called when payment complete on paypal side.

#### Returns

`void`
