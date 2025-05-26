[@bigcommerce/checkout-sdk](../README.md) / BigCommercePaymentsPayPalCustomerInitializeOptions

# Interface: BigCommercePaymentsPayPalCustomerInitializeOptions

A set of options that are required to initialize the customer step of
checkout to support BigCommercePaymentsPayPal.

## Table of contents

### Properties

- [container](BigCommercePaymentsPayPalCustomerInitializeOptions.md#container)

### Methods

- [onClick](BigCommercePaymentsPayPalCustomerInitializeOptions.md#onclick)
- [onComplete](BigCommercePaymentsPayPalCustomerInitializeOptions.md#oncomplete)
- [onError](BigCommercePaymentsPayPalCustomerInitializeOptions.md#onerror)

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
