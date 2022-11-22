[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / AmazonPayCustomerInitializeOptions

# Interface: AmazonPayCustomerInitializeOptions

[<internal>](../modules/internal_.md).AmazonPayCustomerInitializeOptions

A set of options that are required to initialize the customer step of
checkout to support Amazon Pay.

When AmazonPay is initialized, a sign-in button will be inserted into the
DOM. When the customer clicks on it, they will be redirected to Amazon to
sign in.

## Table of contents

### Properties

- [color](internal_.AmazonPayCustomerInitializeOptions.md#color)
- [container](internal_.AmazonPayCustomerInitializeOptions.md#container)
- [size](internal_.AmazonPayCustomerInitializeOptions.md#size)

### Methods

- [onError](internal_.AmazonPayCustomerInitializeOptions.md#onerror)

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
| `error` | [`AmazonPayWidgetError`](internal_.AmazonPayWidgetError.md) \| [`StandardError`](../classes/internal_.StandardError.md) | The error object describing the failure. |

#### Returns

`void`
