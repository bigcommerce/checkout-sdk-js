[@bigcommerce/checkout-sdk](../README.md) / BraintreePaypalCustomerInitializeOptions

# Interface: BraintreePaypalCustomerInitializeOptions

## Table of contents

### Properties

- [container](BraintreePaypalCustomerInitializeOptions.md#container)

### Methods

- [onError](BraintreePaypalCustomerInitializeOptions.md#onerror)

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
| `error` | [`StandardError`](../classes/StandardError.md) \| [`BraintreeError`](BraintreeError.md) | The error object describing the failure. |

#### Returns

`void`
