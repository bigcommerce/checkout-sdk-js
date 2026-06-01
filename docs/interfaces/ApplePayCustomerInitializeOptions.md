[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / ApplePayCustomerInitializeOptions

# Interface: ApplePayCustomerInitializeOptions

A set of options that are required to initialize the customer step of
checkout in order to support ApplePay.

When ApplePay is initialized, a sign-in button will be inserted into the
DOM. When the customer clicks on it, it will trigger apple sheet

## Properties

### container

> **container**: `string`

The ID of a container which the sign-in button should insert into.

***

### shippingLabel?

> `optional` **shippingLabel?**: `string`

Shipping label to be passed to apple sheet.

***

### subtotalLabel?

> `optional` **subtotalLabel?**: `string`

Sub total label to be passed to apple sheet.

## Methods

### onClick()?

> `optional` **onClick**(): `void`

A callback that gets called when wallet button clicked

#### Returns

`void`

***

### onError()?

> `optional` **onError**(`error?`): `void`

A callback that gets called if unable to initialize the widget or select
one of the address options provided by the widget.

#### Parameters

##### error?

`Error`

The error object describing the failure.

#### Returns

`void`

***

### onPaymentAuthorize()

> **onPaymentAuthorize**(): `void`

A callback that gets called when a payment is successfully completed.

#### Returns

`void`
