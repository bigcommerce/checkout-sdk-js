[@bigcommerce/checkout-sdk](../README.md) / PayPalCommerceCreditButtonInitializeOptions

# Interface: PayPalCommerceCreditButtonInitializeOptions

## Table of contents

### Properties

- [buyNowInitializeOptions](PayPalCommerceCreditButtonInitializeOptions.md#buynowinitializeoptions)
- [currencyCode](PayPalCommerceCreditButtonInitializeOptions.md#currencycode)
- [messagingContainerId](PayPalCommerceCreditButtonInitializeOptions.md#messagingcontainerid)
- [style](PayPalCommerceCreditButtonInitializeOptions.md#style)

### Methods

- [onComplete](PayPalCommerceCreditButtonInitializeOptions.md#oncomplete)
- [onEligibilityFailure](PayPalCommerceCreditButtonInitializeOptions.md#oneligibilityfailure)

## Properties

### buyNowInitializeOptions

• `Optional` **buyNowInitializeOptions**: [`PayPalBuyNowInitializeOptions_2`](PayPalBuyNowInitializeOptions_2.md)

The options that are required to initialize Buy Now functionality.

___

### currencyCode

• `Optional` **currencyCode**: `string`

The option that used to initialize a PayPal script with provided currency code.

___

### messagingContainerId

• `Optional` **messagingContainerId**: `string`

The ID of a container which the messaging should be inserted.

___

### style

• `Optional` **style**: [`PayPalButtonStyleOptions_2`](PayPalButtonStyleOptions_2.md)

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
