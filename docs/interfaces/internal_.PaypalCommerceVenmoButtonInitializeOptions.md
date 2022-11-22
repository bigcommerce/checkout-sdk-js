[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / PaypalCommerceVenmoButtonInitializeOptions

# Interface: PaypalCommerceVenmoButtonInitializeOptions

[<internal>](../modules/internal_.md).PaypalCommerceVenmoButtonInitializeOptions

## Table of contents

### Properties

- [buyNowInitializeOptions](internal_.PaypalCommerceVenmoButtonInitializeOptions.md#buynowinitializeoptions)
- [currencyCode](internal_.PaypalCommerceVenmoButtonInitializeOptions.md#currencycode)
- [initializesOnCheckoutPage](internal_.PaypalCommerceVenmoButtonInitializeOptions.md#initializesoncheckoutpage)
- [style](internal_.PaypalCommerceVenmoButtonInitializeOptions.md#style)

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

### style

• `Optional` **style**: [`PaypalButtonStyleOptions_2`](internal_.PaypalButtonStyleOptions_2.md)

A set of styling options for the checkout button.
