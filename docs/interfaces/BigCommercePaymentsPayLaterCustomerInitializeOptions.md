[@bigcommerce/checkout-sdk](../README.md) / BigCommercePaymentsPayLaterCustomerInitializeOptions

# Interface: BigCommercePaymentsPayLaterCustomerInitializeOptions

## Table of contents

### Properties

- [container](BigCommercePaymentsPayLaterCustomerInitializeOptions.md#container)

### Methods

- [onClick](BigCommercePaymentsPayLaterCustomerInitializeOptions.md#onclick)
- [onComplete](BigCommercePaymentsPayLaterCustomerInitializeOptions.md#oncomplete)
- [onError](BigCommercePaymentsPayLaterCustomerInitializeOptions.md#onerror)

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
