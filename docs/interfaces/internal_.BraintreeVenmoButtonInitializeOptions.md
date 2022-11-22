[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / BraintreeVenmoButtonInitializeOptions

# Interface: BraintreeVenmoButtonInitializeOptions

[<internal>](../modules/internal_.md).BraintreeVenmoButtonInitializeOptions

## Table of contents

### Properties

- [buyNowInitializeOptions](internal_.BraintreeVenmoButtonInitializeOptions.md#buynowinitializeoptions)
- [currencyCode](internal_.BraintreeVenmoButtonInitializeOptions.md#currencycode)

### Methods

- [onError](internal_.BraintreeVenmoButtonInitializeOptions.md#onerror)

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

## Methods

### onError

▸ `Optional` **onError**(`error`): `void`

A callback that gets called on any error.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | [`BraintreeError`](internal_.BraintreeError.md) \| [`StandardError`](../classes/internal_.StandardError.md) | The error object describing the failure. |

#### Returns

`void`
