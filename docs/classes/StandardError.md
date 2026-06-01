[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / StandardError

# Abstract Class: StandardError

This error type should not be constructed directly. It is a base class for
all custom errors thrown in this library.

## Extends

- `Error`

## Extended by

- [`CartChangedError`](CartChangedError.md)
- [`CartConsistencyError`](CartConsistencyError.md)
- [`CartStockPositionsChangedError`](CartStockPositionsChangedError.md)
- [`RequestError`](RequestError.md)

## Implements

- [`CustomError`](../interfaces/CustomError.md)

## Constructors

### Constructor

> **new StandardError**(`message?`): `StandardError`

#### Parameters

##### message?

`string`

#### Returns

`StandardError`

#### Overrides

`Error.constructor`

## Properties

### name

> **name**: `string`

#### Implementation of

`CustomError.name`

#### Overrides

`Error.name`

***

### type

> **type**: `string`

#### Implementation of

[`CustomError`](../interfaces/CustomError.md).[`type`](../interfaces/CustomError.md#type)
