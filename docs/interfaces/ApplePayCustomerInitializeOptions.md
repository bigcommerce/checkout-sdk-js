[@bigcommerce/checkout-sdk](../README.md) / ApplePayCustomerInitializeOptions

# Interface: ApplePayCustomerInitializeOptions

A set of options that are required to initialize the customer step of
checkout in order to support ApplePay.

When ApplePay is initialized, a sign-in button will be inserted into the
DOM. When the customer clicks on it, it will trigger apple sheet

## Table of contents

### Properties

- [container](ApplePayCustomerInitializeOptions.md#container)
- [shippingLabel](ApplePayCustomerInitializeOptions.md#shippinglabel)
- [subtotalLabel](ApplePayCustomerInitializeOptions.md#subtotallabel)

### Methods

- [onError](ApplePayCustomerInitializeOptions.md#onerror)
- [onPaymentAuthorize](ApplePayCustomerInitializeOptions.md#onpaymentauthorize)

## Properties

### container

• **container**: `string`

The ID of a container which the sign-in button should insert into.

___

### shippingLabel

• `Optional` **shippingLabel**: `string`

Shipping label to be passed to apple sheet.

___

### subtotalLabel

• `Optional` **subtotalLabel**: `string`

Sub total label to be passed to apple sheet.

## Methods

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

___

### onPaymentAuthorize

▸ **onPaymentAuthorize**(): `void`

A callback that gets called when a payment is successfully completed.

#### Returns

`void`
