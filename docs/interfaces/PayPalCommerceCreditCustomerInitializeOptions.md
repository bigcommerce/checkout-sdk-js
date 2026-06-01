[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / PayPalCommerceCreditCustomerInitializeOptions

# Interface: PayPalCommerceCreditCustomerInitializeOptions

## Properties

### container

> **container**: `string`

The ID of a container which the checkout button should be inserted into.

## Methods

### onClick()?

> `optional` **onClick**(): `void`

A callback that gets called when paypal button clicked.

#### Returns

`void`

***

### onComplete()?

> `optional` **onComplete**(): `void`

A callback that gets called when payment complete on paypal side.

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
