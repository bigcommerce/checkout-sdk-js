[@bigcommerce/checkout-sdk](../README.md) / PaypalCommerceCreditButtonInitializeOptions

# Interface: PaypalCommerceCreditButtonInitializeOptions

## Table of contents

### Properties

- [buyNowInitializeOptions](PaypalCommerceCreditButtonInitializeOptions.md#buynowinitializeoptions)
- [currencyCode](PaypalCommerceCreditButtonInitializeOptions.md#currencycode)
- [initializesOnCheckoutPage](PaypalCommerceCreditButtonInitializeOptions.md#initializesoncheckoutpage)
- [messagingContainerId](PaypalCommerceCreditButtonInitializeOptions.md#messagingcontainerid)
- [style](PaypalCommerceCreditButtonInitializeOptions.md#style)

### Methods

- [onComplete](PaypalCommerceCreditButtonInitializeOptions.md#oncomplete)

## Properties

### buyNowInitializeOptions

• `Optional` **buyNowInitializeOptions**: `Object`

The options that are required to initialize Buy Now functionality.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `getBuyNowCartRequestBody?` | () => `void` \| [`BuyNowCartRequestBody`](BuyNowCartRequestBody.md) |

___

### currencyCode

• `Optional` **currencyCode**: `string`

The option that used to initialize a PayPal script with provided currency code.

___

### initializesOnCheckoutPage

• `Optional` **initializesOnCheckoutPage**: `boolean`

Flag which helps to detect that the strategy initializes on Checkout page

___

### messagingContainerId

• `Optional` **messagingContainerId**: `string`

The ID of a container which the messaging should be inserted.

___

### style

• `Optional` **style**: [`PaypalButtonStyleOptions_2`](PaypalButtonStyleOptions_2.md)

A set of styling options for the checkout button.

## Methods

### onComplete

▸ `Optional` **onComplete**(): `void`

A callback that gets called when payment complete on paypal side.

#### Returns

`void`
