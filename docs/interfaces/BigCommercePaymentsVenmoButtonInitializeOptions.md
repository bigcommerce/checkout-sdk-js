[@bigcommerce/checkout-sdk](../README.md) / BigCommercePaymentsVenmoButtonInitializeOptions

# Interface: BigCommercePaymentsVenmoButtonInitializeOptions

## Table of contents

### Properties

- [buyNowInitializeOptions](BigCommercePaymentsVenmoButtonInitializeOptions.md#buynowinitializeoptions)
- [currencyCode](BigCommercePaymentsVenmoButtonInitializeOptions.md#currencycode)
- [style](BigCommercePaymentsVenmoButtonInitializeOptions.md#style)

### Methods

- [onEligibilityFailure](BigCommercePaymentsVenmoButtonInitializeOptions.md#oneligibilityfailure)

## Properties

### buyNowInitializeOptions

• `Optional` **buyNowInitializeOptions**: [`PayPalBuyNowInitializeOptions`](PayPalBuyNowInitializeOptions.md)

The options that required to initialize Buy Now functionality.

___

### currencyCode

• `Optional` **currencyCode**: `string`

The option that used to initialize a PayPal script with provided currency code.

___

### style

• `Optional` **style**: [`PayPalButtonStyleOptions`](PayPalButtonStyleOptions.md)

A set of styling options for the checkout button.

## Methods

### onEligibilityFailure

▸ `Optional` **onEligibilityFailure**(): `void`

 A callback that gets called when PayPal SDK restricts to render PayPal component.

#### Returns

`void`
