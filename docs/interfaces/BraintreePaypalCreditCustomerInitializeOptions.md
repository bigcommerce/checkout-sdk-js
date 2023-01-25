[@bigcommerce/checkout-sdk](../README.md) / BraintreePaypalCreditCustomerInitializeOptions

# Interface: BraintreePaypalCreditCustomerInitializeOptions

## Table of contents

### Properties

- [container](BraintreePaypalCreditCustomerInitializeOptions.md#container)

### Methods

- [onError](BraintreePaypalCreditCustomerInitializeOptions.md#onerror)

## Properties

### container

• **container**: `string`

The ID of a container which the checkout button should be inserted into.

## Methods

### onError

▸ `Optional` **onError**(`error`): `void`

A callback that gets called on any error instead of submit payment or authorization errors.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | [`BraintreeError`](BraintreeError.md) \| [`StandardError`](../classes/StandardError.md) | The error object describing the failure. |

#### Returns

`void`
