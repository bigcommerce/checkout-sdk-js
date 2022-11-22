[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / CartChangedError

# Class: CartChangedError

[<internal>](../modules/internal_.md).CartChangedError

This error type should not be constructed directly. It is a base class for
all custom errors thrown in this library.

## Hierarchy

- [`StandardError`](internal_.StandardError.md)

  ↳ **`CartChangedError`**

## Table of contents

### Constructors

- [constructor](internal_.CartChangedError.md#constructor)

### Properties

- [name](internal_.CartChangedError.md#name)
- [type](internal_.CartChangedError.md#type)

## Constructors

### constructor

• **new CartChangedError**(`previous`, `updated`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `previous` | [`ComparableCheckout`](../modules/internal_.md#comparablecheckout) |
| `updated` | [`ComparableCheckout`](../modules/internal_.md#comparablecheckout) |

#### Overrides

[StandardError](internal_.StandardError.md).[constructor](internal_.StandardError.md#constructor)

## Properties

### name

• **name**: `string`

#### Inherited from

[StandardError](internal_.StandardError.md).[name](internal_.StandardError.md#name)

___

### type

• **type**: `string`

#### Inherited from

[StandardError](internal_.StandardError.md).[type](internal_.StandardError.md#type)
