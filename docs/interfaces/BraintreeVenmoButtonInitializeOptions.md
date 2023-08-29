[@bigcommerce/checkout-sdk](../README.md) / BraintreeVenmoButtonInitializeOptions

# Interface: BraintreeVenmoButtonInitializeOptions

## Table of contents

### Properties

- [buyNowInitializeOptions](BraintreeVenmoButtonInitializeOptions.md#buynowinitializeoptions)
- [currencyCode](BraintreeVenmoButtonInitializeOptions.md#currencycode)

### Methods

- [onError](BraintreeVenmoButtonInitializeOptions.md#onerror)

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

## Methods

### onError

▸ `Optional` **onError**(`error`): `void`

A callback that gets called on any error.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | [`BraintreeError`](BraintreeError.md) \| [`StandardError`](../classes/StandardError.md) | The error object describing the failure. |

#### Returns

`void`
