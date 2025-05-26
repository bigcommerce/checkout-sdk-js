[@bigcommerce/checkout-sdk](../README.md) / PayPalCommerceVenmoButtonInitializeOptions

# Interface: PayPalCommerceVenmoButtonInitializeOptions

## Table of contents

### Properties

- [buyNowInitializeOptions](PayPalCommerceVenmoButtonInitializeOptions.md#buynowinitializeoptions)
- [currencyCode](PayPalCommerceVenmoButtonInitializeOptions.md#currencycode)
- [style](PayPalCommerceVenmoButtonInitializeOptions.md#style)

### Methods

- [onEligibilityFailure](PayPalCommerceVenmoButtonInitializeOptions.md#oneligibilityfailure)

## Properties

### buyNowInitializeOptions

• `Optional` **buyNowInitializeOptions**: [`PayPalBuyNowInitializeOptions_2`](PayPalBuyNowInitializeOptions_2.md)

The options that required to initialize Buy Now functionality.

___

### currencyCode

• `Optional` **currencyCode**: `string`

The option that used to initialize a PayPal script with provided currency code.

___

### style

• `Optional` **style**: [`PayPalButtonStyleOptions_2`](PayPalButtonStyleOptions_2.md)

A set of styling options for the checkout button.

## Methods

### onEligibilityFailure

▸ `Optional` **onEligibilityFailure**(): `void`

 A callback that gets called when PayPal SDK restricts to render PayPal component.

#### Returns

`void`
