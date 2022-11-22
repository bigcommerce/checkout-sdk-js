[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / StripeShippingEvent

# Interface: StripeShippingEvent

[<internal>](../modules/internal_.md).StripeShippingEvent

## Hierarchy

- [`StripeEvent`](internal_.StripeEvent.md)

  ↳ **`StripeShippingEvent`**

## Table of contents

### Properties

- [complete](internal_.StripeShippingEvent.md#complete)
- [elementType](internal_.StripeShippingEvent.md#elementtype)
- [empty](internal_.StripeShippingEvent.md#empty)
- [isNewAddress](internal_.StripeShippingEvent.md#isnewaddress)
- [value](internal_.StripeShippingEvent.md#value)

## Properties

### complete

• **complete**: `boolean`

#### Inherited from

[StripeEvent](internal_.StripeEvent.md).[complete](internal_.StripeEvent.md#complete)

___

### elementType

• **elementType**: `string`

#### Inherited from

[StripeEvent](internal_.StripeEvent.md).[elementType](internal_.StripeEvent.md#elementtype)

___

### empty

• **empty**: `boolean`

#### Inherited from

[StripeEvent](internal_.StripeEvent.md).[empty](internal_.StripeEvent.md#empty)

___

### isNewAddress

• `Optional` **isNewAddress**: `boolean`

___

### value

• **value**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `address` | { `city`: `string` ; `country`: `string` ; `line1`: `string` ; `line2?`: `string` ; `postal_code`: `string` ; `state`: `string`  } |
| `address.city` | `string` |
| `address.country` | `string` |
| `address.line1` | `string` |
| `address.line2?` | `string` |
| `address.postal_code` | `string` |
| `address.state` | `string` |
| `name` | `string` |
