[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / CartChangedError

# Class: CartChangedError

This error type should not be constructed directly. It is a base class for
all custom errors thrown in this library.

## Extends

- [`StandardError`](StandardError.md)

## Constructors

### Constructor

> **new CartChangedError**(`previous`, `updated`): `CartChangedError`

#### Parameters

##### previous

[`ComparableCheckout`](../type-aliases/ComparableCheckout.md)

##### updated

[`ComparableCheckout`](../type-aliases/ComparableCheckout.md)

#### Returns

`CartChangedError`

#### Overrides

[`StandardError`](StandardError.md).[`constructor`](StandardError.md#constructor)

## Properties

### data

> **data**: `object`

**`Alpha`**

Please note that this option is currently in an early stage of
development. Therefore the API is unstable and not ready for public
consumption.

#### previous

> **previous**: [`ComparableCheckout`](../type-aliases/ComparableCheckout.md)

#### updated

> **updated**: [`ComparableCheckout`](../type-aliases/ComparableCheckout.md)

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
