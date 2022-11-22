[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / PaypalCommerceAlternativeMethodsButtonOptions

# Interface: PaypalCommerceAlternativeMethodsButtonOptions

[<internal>](../modules/internal_.md).PaypalCommerceAlternativeMethodsButtonOptions

## Table of contents

### Properties

- [apm](internal_.PaypalCommerceAlternativeMethodsButtonOptions.md#apm)
- [buyNowInitializeOptions](internal_.PaypalCommerceAlternativeMethodsButtonOptions.md#buynowinitializeoptions)
- [currencyCode](internal_.PaypalCommerceAlternativeMethodsButtonOptions.md#currencycode)
- [initializesOnCheckoutPage](internal_.PaypalCommerceAlternativeMethodsButtonOptions.md#initializesoncheckoutpage)
- [style](internal_.PaypalCommerceAlternativeMethodsButtonOptions.md#style)

## Properties

### apm

• **apm**: `string`

Alternative payment method id what used for initialization PayPal button as funding source.

___

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

Flag which helps to detect that the strategy initializes on Checkout page.

___

### style

• `Optional` **style**: [`PaypalButtonStyleOptions_2`](internal_.PaypalButtonStyleOptions_2.md)

A set of styling options for the checkout button.
