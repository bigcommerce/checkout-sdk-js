[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / ApplePayCustomerInitializeOptions

# Interface: ApplePayCustomerInitializeOptions

[<internal>](../modules/internal_.md).ApplePayCustomerInitializeOptions

A set of options that are required to initialize the customer step of
checkout in order to support ApplePay.

When ApplePay is initialized, a sign-in button will be inserted into the
DOM. When the customer clicks on it, it will trigger apple sheet

## Table of contents

### Properties

- [container](internal_.ApplePayCustomerInitializeOptions.md#container)
- [shippingLabel](internal_.ApplePayCustomerInitializeOptions.md#shippinglabel)
- [subtotalLabel](internal_.ApplePayCustomerInitializeOptions.md#subtotallabel)

### Methods

- [onError](internal_.ApplePayCustomerInitializeOptions.md#onerror)
- [onPaymentAuthorize](internal_.ApplePayCustomerInitializeOptions.md#onpaymentauthorize)

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
