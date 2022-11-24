[@bigcommerce/checkout-sdk](../README.md) / PaypalCommerceAlternativeMethodsButtonOptions

# Interface: PaypalCommerceAlternativeMethodsButtonOptions

## Table of contents

### Properties

- [apm](PaypalCommerceAlternativeMethodsButtonOptions.md#apm)
- [buyNowInitializeOptions](PaypalCommerceAlternativeMethodsButtonOptions.md#buynowinitializeoptions)
- [currencyCode](PaypalCommerceAlternativeMethodsButtonOptions.md#currencycode)
- [initializesOnCheckoutPage](PaypalCommerceAlternativeMethodsButtonOptions.md#initializesoncheckoutpage)
- [style](PaypalCommerceAlternativeMethodsButtonOptions.md#style)

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
| `getBuyNowCartRequestBody?` | () => `void` \| [`BuyNowCartRequestBody`](BuyNowCartRequestBody.md) |

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

• `Optional` **style**: [`PaypalButtonStyleOptions_2`](PaypalButtonStyleOptions_2.md)

A set of styling options for the checkout button.
