[@bigcommerce/checkout-sdk](../README.md) / StandardError

# Class: StandardError

This error type should not be constructed directly. It is a base class for
all custom errors thrown in this library.

## Hierarchy

- `Error`

  ↳ **`StandardError`**

  ↳↳ [`CartChangedError`](CartChangedError.md)

  ↳↳ [`CartConsistencyError`](CartConsistencyError.md)

  ↳↳ [`RequestError`](RequestError.md)

## Implements

- [`CustomError`](../interfaces/CustomError.md)

## Table of contents

### Constructors

- [constructor](StandardError.md#constructor)

### Properties

- [name](StandardError.md#name)
- [type](StandardError.md#type)

## Constructors

### constructor

• **new StandardError**(`message?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message?` | `string` |

#### Overrides

Error.constructor

## Properties

### name

• **name**: `string`

#### Implementation of

CustomError.name

#### Overrides

Error.name

___

### type

• **type**: `string`

#### Implementation of

[CustomError](../interfaces/CustomError.md).[type](../interfaces/CustomError.md#type)
