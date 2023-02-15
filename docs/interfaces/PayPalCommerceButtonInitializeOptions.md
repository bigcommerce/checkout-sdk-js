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

• `Optional` **buyNowInitializeOptions**: [`PayPalBuyNowInitializeOptions`](PayPalBuyNowInitializeOptions.md)

The options that are required to initialize Buy Now functionality.

___

### currencyCode

• `Optional` **currencyCode**: `string`

The option that used to initialize a PayPal script with provided currency code.

___

### initializesOnCheckoutPage

• `Optional` **initializesOnCheckoutPage**: `boolean`

// TODO: this flag should be removed, because the strategy does not used on checkout page
// and it always equals to 'false'
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
