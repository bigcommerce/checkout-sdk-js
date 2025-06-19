[@bigcommerce/checkout-sdk](../README.md) / BigcommercePaymentsCustomerInitializeOptions

# Interface: BigcommercePaymentsCustomerInitializeOptions

A set of options that are required to initialize the customer step of
checkout to support BigCommercePayments.

## Table of contents

### Properties

- [container](BigcommercePaymentsCustomerInitializeOptions.md#container)

### Methods

- [onClick](BigcommercePaymentsCustomerInitializeOptions.md#onclick)
- [onComplete](BigcommercePaymentsCustomerInitializeOptions.md#oncomplete)
- [onError](BigcommercePaymentsCustomerInitializeOptions.md#onerror)

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
