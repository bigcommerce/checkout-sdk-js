[@bigcommerce/checkout-sdk](../README.md) / CartChangedError

# Class: CartChangedError

## Hierarchy

- [`StandardError`](StandardError.md)

  ↳ **`CartChangedError`**

## Table of contents

### Constructors

- [constructor](CartChangedError.md#constructor)

### Properties

- [data](CartChangedError.md#data)
- [name](CartChangedError.md#name)
- [type](CartChangedError.md#type)

## Constructors

### constructor

• **new CartChangedError**(`previous`, `updated`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `previous` | [`ComparableCheckout`](../README.md#comparablecheckout) |
| `updated` | [`ComparableCheckout`](../README.md#comparablecheckout) |

#### Overrides

[StandardError](StandardError.md).[constructor](StandardError.md#constructor)

## Properties

### data

• **data**: `Object`

**`alpha`**
Please note that this option is currently in an early stage of
development. Therefore the API is unstable and not ready for public
consumption.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `previous` | [`ComparableCheckout`](../README.md#comparablecheckout) |
| `updated` | [`ComparableCheckout`](../README.md#comparablecheckout) |

___

### name

• **name**: `string`

#### Inherited from

[StandardError](StandardError.md).[name](StandardError.md#name)

___

### type

• **type**: `string`

#### Inherited from

[StandardError](StandardError.md).[type](StandardError.md#type)
