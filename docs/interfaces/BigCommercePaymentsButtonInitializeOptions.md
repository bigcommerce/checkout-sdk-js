[@bigcommerce/checkout-sdk](../README.md) / BigCommercePaymentsButtonInitializeOptions

# Interface: BigCommercePaymentsButtonInitializeOptions

A set of options that are required to initialize BigCommercePaymentsButtonStrategy in cart or product details page.

When BigCommercePayments is initialized, an BigCommercePayments PayPal button will be inserted into the
DOM. When a customer clicks on it, it will trigger PayPal flow.

## Table of contents

### Properties

- [buyNowInitializeOptions](BigCommercePaymentsButtonInitializeOptions.md#buynowinitializeoptions)
- [currencyCode](BigCommercePaymentsButtonInitializeOptions.md#currencycode)
- [style](BigCommercePaymentsButtonInitializeOptions.md#style)

### Methods

- [onComplete](BigCommercePaymentsButtonInitializeOptions.md#oncomplete)
- [onEligibilityFailure](BigCommercePaymentsButtonInitializeOptions.md#oneligibilityfailure)

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
