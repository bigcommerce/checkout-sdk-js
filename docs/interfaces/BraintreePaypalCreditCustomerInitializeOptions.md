[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / BraintreePaypalCreditCustomerInitializeOptions

# Interface: BraintreePaypalCreditCustomerInitializeOptions

## Properties

### buttonHeight?

> `optional` **buttonHeight?**: `number`

***

### container

> **container**: `string`

The ID of a container which the checkout button should be inserted into.

## Methods

### onClick()?

> `optional` **onClick**(): `void`

A callback that gets called when wallet button clicked

#### Returns

`void`

***

### onError()?

> `optional` **onError**(`error`): `void`

A callback that gets called on any error instead of submit payment or authorization errors.

#### Parameters

##### error

`StandardError` \| `BraintreeError`

The error object describing the failure.

#### Returns

`void`
