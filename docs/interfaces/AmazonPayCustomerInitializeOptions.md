[@bigcommerce/checkout-sdk](../README.md) / AmazonPayCustomerInitializeOptions

# Interface: AmazonPayCustomerInitializeOptions

A set of options that are required to initialize the customer step of
checkout to support Amazon Pay.

When AmazonPay is initialized, a sign-in button will be inserted into the
DOM. When the customer clicks on it, they will be redirected to Amazon to
sign in.

## Table of contents

### Properties

- [color](AmazonPayCustomerInitializeOptions.md#color)
- [container](AmazonPayCustomerInitializeOptions.md#container)
- [size](AmazonPayCustomerInitializeOptions.md#size)

### Methods

- [onError](AmazonPayCustomerInitializeOptions.md#onerror)

## Properties

### color

• `Optional` **color**: ``"Gold"`` \| ``"LightGray"`` \| ``"DarkGray"``

The colour of the sign-in button.

___

### container

• **container**: `string`

The ID of a container which the sign-in button should insert into.

___

### size

• `Optional` **size**: ``"small"`` \| ``"medium"`` \| ``"large"`` \| ``"x-large"``

The size of the sign-in button.

## Methods

### onError

▸ `Optional` **onError**(`error`): `void`

A callback that gets called if unable to initialize the widget or select
one of the address options provided by the widget.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | [`AmazonPayWidgetError`](AmazonPayWidgetError.md) \| [`StandardError`](../classes/StandardError.md) | The error object describing the failure. |

#### Returns

`void`
