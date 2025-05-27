[@bigcommerce/checkout-sdk](../README.md) / BigCommercePaymentsPayLaterButtonInitializeOptions

# Interface: BigCommercePaymentsPayLaterButtonInitializeOptions

## Table of contents

### Properties

- [buyNowInitializeOptions](BigCommercePaymentsPayLaterButtonInitializeOptions.md#buynowinitializeoptions)
- [currencyCode](BigCommercePaymentsPayLaterButtonInitializeOptions.md#currencycode)
- [messagingContainerId](BigCommercePaymentsPayLaterButtonInitializeOptions.md#messagingcontainerid)
- [style](BigCommercePaymentsPayLaterButtonInitializeOptions.md#style)

### Methods

- [onComplete](BigCommercePaymentsPayLaterButtonInitializeOptions.md#oncomplete)
- [onEligibilityFailure](BigCommercePaymentsPayLaterButtonInitializeOptions.md#oneligibilityfailure)

## Properties

### buyNowInitializeOptions

• `Optional` **buyNowInitializeOptions**: [`PayPalBuyNowInitializeOptions`](PayPalBuyNowInitializeOptions.md)

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
