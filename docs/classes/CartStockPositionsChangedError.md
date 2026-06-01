[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / CartStockPositionsChangedError

# Class: CartStockPositionsChangedError

This error is thrown when at least one cart item changed stock position (e.g. moved to a different warehouse)
and the server returns type `cart_stock_positions_changed`.

## Extends

- [`StandardError`](StandardError.md)

## Constructors

### Constructor

> **new CartStockPositionsChangedError**(`changedItemIds`, `message?`): `CartStockPositionsChangedError`

#### Parameters

##### changedItemIds

`string`[]

##### message?

`string`

#### Returns

`CartStockPositionsChangedError`

#### Overrides

[`StandardError`](StandardError.md).[`constructor`](StandardError.md#constructor)

## Properties

### changedItemIds

> **changedItemIds**: `string`[]

***

### name

> **name**: `string`

#### Inherited from

[`StandardError`](StandardError.md).[`name`](StandardError.md#name)

***

### type

> **type**: `string`

#### Inherited from

[`StandardError`](StandardError.md).[`type`](StandardError.md#type)
