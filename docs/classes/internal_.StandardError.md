[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / StandardError

# Class: StandardError

[<internal>](../modules/internal_.md).StandardError

This error type should not be constructed directly. It is a base class for
all custom errors thrown in this library.

## Hierarchy

- `Error`

  ↳ **`StandardError`**

  ↳↳ [`CartChangedError`](internal_.CartChangedError.md)

  ↳↳ [`RequestError`](internal_.RequestError.md)

## Implements

- [`CustomError`](../interfaces/internal_.CustomError.md)

## Table of contents

### Constructors

- [constructor](internal_.StandardError.md#constructor)

### Properties

- [name](internal_.StandardError.md#name)
- [type](internal_.StandardError.md#type)

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

[CustomError](../interfaces/internal_.CustomError.md).[type](../interfaces/internal_.CustomError.md#type)
