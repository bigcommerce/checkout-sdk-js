[@bigcommerce/checkout-sdk](../README.md) / PayPalCommerceCustomerInitializeOptions

# Interface: PayPalCommerceCustomerInitializeOptions

A set of options that are required to initialize the customer step of
checkout to support PayPalCommerce.

## Table of contents

### Properties

- [container](PayPalCommerceCustomerInitializeOptions.md#container)

### Methods

- [onComplete](PayPalCommerceCustomerInitializeOptions.md#oncomplete)
- [onError](PayPalCommerceCustomerInitializeOptions.md#onerror)

## Properties

### container

• **container**: `string`

The ID of a container which the checkout button should be inserted into.

## Methods

### onComplete

▸ `Optional` **onComplete**(): `void`

A callback that gets called when payment complete on paypal side.

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
