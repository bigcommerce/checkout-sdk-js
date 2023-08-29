[@bigcommerce/checkout-sdk](../README.md) / CartConsistencyError

# Class: CartConsistencyError

This error is thrown when the server detects inconsistency in cart data since it is last requested,
for example, product prices or eligible discounts have changed.

## Hierarchy

- [`StandardError`](StandardError.md)

  ↳ **`CartConsistencyError`**

## Table of contents

### Constructors

- [constructor](CartConsistencyError.md#constructor)

### Properties

- [name](CartConsistencyError.md#name)
- [type](CartConsistencyError.md#type)

## Constructors

### constructor

• **new CartConsistencyError**(`message?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message?` | `string` |

#### Overrides

[StandardError](StandardError.md).[constructor](StandardError.md#constructor)

## Properties

### name

• **name**: `string`

#### Inherited from

[StandardError](StandardError.md).[name](StandardError.md#name)

___

### type

• **type**: `string`

#### Inherited from

[StandardError](StandardError.md).[type](StandardError.md#type)
