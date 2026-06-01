[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / CartConsistencyError

# Class: CartConsistencyError

This error is thrown when the server detects inconsistency in cart data since it is last requested,
for example, product prices or eligible discounts have changed.

## Extends

- [`StandardError`](StandardError.md)

## Constructors

### Constructor

> **new CartConsistencyError**(`message?`): `CartConsistencyError`

#### Parameters

##### message?

`string`

#### Returns

`CartConsistencyError`

#### Overrides

[`StandardError`](StandardError.md).[`constructor`](StandardError.md#constructor)

## Properties

### name

> **name**: `string`

#### Inherited from

[`StandardError`](StandardError.md).[`name`](StandardError.md#name)

***

### type

> **type**: `string`

#### Inherited from

[`StandardError`](StandardError.md).[`type`](StandardError.md#type)
