[@bigcommerce/checkout-sdk](../README.md) / BraintreePaypalCreditCustomerInitializeOptions

# Interface: BraintreePaypalCreditCustomerInitializeOptions

## Table of contents

### Properties

- [buttonHeight](BraintreePaypalCreditCustomerInitializeOptions.md#buttonheight)
- [container](BraintreePaypalCreditCustomerInitializeOptions.md#container)

### Methods

- [onClick](BraintreePaypalCreditCustomerInitializeOptions.md#onclick)
- [onError](BraintreePaypalCreditCustomerInitializeOptions.md#onerror)

## Properties

### buttonHeight

• `Optional` **buttonHeight**: `number`

___

### container

• **container**: `string`

The ID of a container which the checkout button should be inserted into.

## Methods

### onClick

▸ `Optional` **onClick**(): `void`

A callback that gets called when wallet button clicked

#### Returns

`void`

___

### onError

▸ `Optional` **onError**(`error`): `void`

A callback that gets called on any error instead of submit payment or authorization errors.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | [`BraintreeError`](BraintreeError.md) \| [`StandardError`](../classes/StandardError.md) | The error object describing the failure. |

#### Returns

`void`
