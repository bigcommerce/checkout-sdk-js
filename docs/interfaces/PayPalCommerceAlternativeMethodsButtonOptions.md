[@bigcommerce/checkout-sdk](../README.md) / PayPalCommerceAlternativeMethodsButtonOptions

# Interface: PayPalCommerceAlternativeMethodsButtonOptions

## Table of contents

### Properties

- [apm](PayPalCommerceAlternativeMethodsButtonOptions.md#apm)
- [buyNowInitializeOptions](PayPalCommerceAlternativeMethodsButtonOptions.md#buynowinitializeoptions)
- [currencyCode](PayPalCommerceAlternativeMethodsButtonOptions.md#currencycode)
- [style](PayPalCommerceAlternativeMethodsButtonOptions.md#style)

### Methods

- [onEligibilityFailure](PayPalCommerceAlternativeMethodsButtonOptions.md#oneligibilityfailure)

## Properties

### apm

• **apm**: `string`

Alternative payment method id what used for initialization PayPal button as funding source.

___

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
