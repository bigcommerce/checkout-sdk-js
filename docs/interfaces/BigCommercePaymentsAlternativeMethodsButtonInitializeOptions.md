[@bigcommerce/checkout-sdk](../README.md) / BigCommercePaymentsAlternativeMethodsButtonInitializeOptions

# Interface: BigCommercePaymentsAlternativeMethodsButtonInitializeOptions

## Table of contents

### Properties

- [apm](BigCommercePaymentsAlternativeMethodsButtonInitializeOptions.md#apm)
- [buyNowInitializeOptions](BigCommercePaymentsAlternativeMethodsButtonInitializeOptions.md#buynowinitializeoptions)
- [currencyCode](BigCommercePaymentsAlternativeMethodsButtonInitializeOptions.md#currencycode)
- [style](BigCommercePaymentsAlternativeMethodsButtonInitializeOptions.md#style)

### Methods

- [onEligibilityFailure](BigCommercePaymentsAlternativeMethodsButtonInitializeOptions.md#oneligibilityfailure)

## Properties

### apm

• **apm**: `string`

Alternative payment method id what used for initialization PayPal button as funding source.

___

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
