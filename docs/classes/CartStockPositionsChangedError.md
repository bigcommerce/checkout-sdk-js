[@bigcommerce/checkout-sdk](../README.md) / CartStockPositionsChangedError

# Class: CartStockPositionsChangedError

This error is thrown when at least one cart item changed stock position (e.g. moved to a different warehouse)
and the server returns type `cart_stock_positions_changed`.

## Hierarchy

- [`StandardError`](StandardError.md)

  ↳ **`CartStockPositionsChangedError`**

## Table of contents

### Constructors

- [constructor](CartStockPositionsChangedError.md#constructor)

### Properties

- [changedItemIds](CartStockPositionsChangedError.md#changeditemids)
- [name](CartStockPositionsChangedError.md#name)
- [type](CartStockPositionsChangedError.md#type)

## Constructors

### constructor

• **new CartStockPositionsChangedError**(`changedItemIds`, `message?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `changedItemIds` | `string`[] |
| `message?` | `string` |

#### Overrides

[StandardError](StandardError.md).[constructor](StandardError.md#constructor)

## Properties

### changedItemIds

• **changedItemIds**: `string`[]

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
