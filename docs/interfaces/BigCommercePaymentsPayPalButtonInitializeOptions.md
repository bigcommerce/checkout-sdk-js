[@bigcommerce/checkout-sdk](../README.md) / BigCommercePaymentsPayPalButtonInitializeOptions

# Interface: BigCommercePaymentsPayPalButtonInitializeOptions

A set of options that are required to initialize BigCommercePaymentsPayPal in cart or product details page.

When BigCommercePaymentsPayPal is initialized, an BigCommercePaymentsPayPal button will be inserted into the
DOM. When a customer clicks on it, it will trigger Apple sheet.

## Table of contents

### Properties

- [buyNowInitializeOptions](BigCommercePaymentsPayPalButtonInitializeOptions.md#buynowinitializeoptions)
- [currencyCode](BigCommercePaymentsPayPalButtonInitializeOptions.md#currencycode)
- [style](BigCommercePaymentsPayPalButtonInitializeOptions.md#style)

### Methods

- [onComplete](BigCommercePaymentsPayPalButtonInitializeOptions.md#oncomplete)
- [onEligibilityFailure](BigCommercePaymentsPayPalButtonInitializeOptions.md#oneligibilityfailure)

## Properties

### buyNowInitializeOptions

• `Optional` **buyNowInitializeOptions**: [`PayPalBuyNowInitializeOptions`](PayPalBuyNowInitializeOptions.md)

The options that are required to initialize Buy Now functionality.

___

### currencyCode

• `Optional` **currencyCode**: `string`

The option that used to initialize a PayPal script with provided currency code.

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

___

### onEligibilityFailure

▸ `Optional` **onEligibilityFailure**(): `void`

 A callback that gets called when PayPal SDK restricts to render PayPal component.

#### Returns

`void`
