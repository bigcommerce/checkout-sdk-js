[@bigcommerce/checkout-sdk](../README.md) / BraintreePaypalCreditCustomerInitializeOptions_2

# Interface: BraintreePaypalCreditCustomerInitializeOptions\_2

## Table of contents

### Properties

- [buttonHeight](BraintreePaypalCreditCustomerInitializeOptions_2.md#buttonheight)
- [container](BraintreePaypalCreditCustomerInitializeOptions_2.md#container)

### Methods

- [onClick](BraintreePaypalCreditCustomerInitializeOptions_2.md#onclick)
- [onError](BraintreePaypalCreditCustomerInitializeOptions_2.md#onerror)

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
| `error` | `default` \| `BraintreeError` | The error object describing the failure. |

#### Returns

`void`
