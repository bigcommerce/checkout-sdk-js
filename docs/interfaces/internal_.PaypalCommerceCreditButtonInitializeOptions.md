[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / PaypalCommerceCreditButtonInitializeOptions

# Interface: PaypalCommerceCreditButtonInitializeOptions

[<internal>](../modules/internal_.md).PaypalCommerceCreditButtonInitializeOptions

## Table of contents

### Properties

- [buyNowInitializeOptions](internal_.PaypalCommerceCreditButtonInitializeOptions.md#buynowinitializeoptions)
- [currencyCode](internal_.PaypalCommerceCreditButtonInitializeOptions.md#currencycode)
- [initializesOnCheckoutPage](internal_.PaypalCommerceCreditButtonInitializeOptions.md#initializesoncheckoutpage)
- [messagingContainerId](internal_.PaypalCommerceCreditButtonInitializeOptions.md#messagingcontainerid)
- [style](internal_.PaypalCommerceCreditButtonInitializeOptions.md#style)

### Methods

- [onComplete](internal_.PaypalCommerceCreditButtonInitializeOptions.md#oncomplete)

## Properties

### buyNowInitializeOptions

• `Optional` **buyNowInitializeOptions**: `Object`

The options that are required to initialize Buy Now functionality.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `getBuyNowCartRequestBody?` | () => `void` \| [`BuyNowCartRequestBody`](internal_.BuyNowCartRequestBody.md) |

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

• `Optional` **style**: [`PaypalButtonStyleOptions_2`](internal_.PaypalButtonStyleOptions_2.md)

A set of styling options for the checkout button.

## Methods

### onComplete

▸ `Optional` **onComplete**(): `void`

A callback that gets called when payment complete on paypal side.

#### Returns

`void`
