[@bigcommerce/checkout-sdk](../README.md) › [ApplePayCustomerInitializeOptions](applepaycustomerinitializeoptions.md)

# Interface: ApplePayCustomerInitializeOptions

A set of options that are required to initialize the customer step of
checkout in order to support ApplePay.

When ApplePay is initialized, a sign-in button will be inserted into the
DOM. When the customer clicks on it, it will trigger apple sheet

## Hierarchy

* **ApplePayCustomerInitializeOptions**

## Index

### Properties

* [container](applepaycustomerinitializeoptions.md#container)
* [shippingLabel](applepaycustomerinitializeoptions.md#optional-shippinglabel)
* [subtotalLabel](applepaycustomerinitializeoptions.md#optional-subtotallabel)

### Methods

* [onError](applepaycustomerinitializeoptions.md#optional-onerror)
* [onPaymentAuthorize](applepaycustomerinitializeoptions.md#onpaymentauthorize)

## Properties

###  container

• **container**: *string*

The ID of a container which the sign-in button should insert into.

___

### `Optional` shippingLabel

• **shippingLabel**? : *undefined | string*

Shipping label to be passed to apple sheet.

___

### `Optional` subtotalLabel

• **subtotalLabel**? : *undefined | string*

Sub total label to be passed to apple sheet.

## Methods

### `Optional` onError

▸ **onError**(`error?`: [Error](amazonpaywidgeterror.md#error)): *void*

A callback that gets called if unable to initialize the widget or select
one of the address options provided by the widget.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`error?` | [Error](amazonpaywidgeterror.md#error) | The error object describing the failure.  |

**Returns:** *void*

___

###  onPaymentAuthorize

▸ **onPaymentAuthorize**(): *void*

A callback that gets called when a payment is successfully completed.

**Returns:** *void*
