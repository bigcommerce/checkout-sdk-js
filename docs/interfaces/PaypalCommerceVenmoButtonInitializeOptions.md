[@bigcommerce/checkout-sdk](../README.md) / PaypalCommerceVenmoButtonInitializeOptions

# Interface: PaypalCommerceVenmoButtonInitializeOptions

## Table of contents

### Properties

- [buyNowInitializeOptions](PaypalCommerceVenmoButtonInitializeOptions.md#buynowinitializeoptions)
- [currencyCode](PaypalCommerceVenmoButtonInitializeOptions.md#currencycode)
- [initializesOnCheckoutPage](PaypalCommerceVenmoButtonInitializeOptions.md#initializesoncheckoutpage)
- [style](PaypalCommerceVenmoButtonInitializeOptions.md#style)

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

### style

• `Optional` **style**: [`PaypalButtonStyleOptions_2`](PaypalButtonStyleOptions_2.md)

A set of styling options for the checkout button.
