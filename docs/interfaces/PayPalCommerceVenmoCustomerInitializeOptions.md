[@bigcommerce/checkout-sdk](../README.md) / PayPalCommerceVenmoCustomerInitializeOptions

# Interface: PayPalCommerceVenmoCustomerInitializeOptions

## Table of contents

### Properties

- [container](PayPalCommerceVenmoCustomerInitializeOptions.md#container)

### Methods

- [onClick](PayPalCommerceVenmoCustomerInitializeOptions.md#onclick)
- [onError](PayPalCommerceVenmoCustomerInitializeOptions.md#onerror)

## Properties

### container

• **container**: `string`

The ID of a container which the checkout button should be inserted into.

## Methods

### onClick

▸ `Optional` **onClick**(): `void`

A callback that gets called when paypal button clicked.

#### Returns

`void`

___

### onError

▸ `Optional` **onError**(`error?`): `void`

A callback that gets called if unable to initialize the widget or select
one of the address options provided by the widget.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error?` | `Error` | The error object describing the failure. |

#### Returns

`void`
