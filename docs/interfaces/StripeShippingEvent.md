[@bigcommerce/checkout-sdk](../README.md) / StripeShippingEvent

# Interface: StripeShippingEvent

## Hierarchy

- [`StripeEvent`](StripeEvent.md)

  ↳ **`StripeShippingEvent`**

## Table of contents

### Properties

- [complete](StripeShippingEvent.md#complete)
- [elementType](StripeShippingEvent.md#elementtype)
- [empty](StripeShippingEvent.md#empty)
- [isNewAddress](StripeShippingEvent.md#isnewaddress)
- [value](StripeShippingEvent.md#value)

## Properties

### complete

• **complete**: `boolean`

#### Inherited from

[StripeEvent](StripeEvent.md).[complete](StripeEvent.md#complete)

___

### elementType

• **elementType**: `string`

#### Inherited from

[StripeEvent](StripeEvent.md).[elementType](StripeEvent.md#elementtype)

___

### empty

• **empty**: `boolean`

#### Inherited from

[StripeEvent](StripeEvent.md).[empty](StripeEvent.md#empty)

___

### isNewAddress

• `Optional` **isNewAddress**: `boolean`

___

### value

• **value**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `address` | `Object` |
| `address.city` | `string` |
| `address.country` | `string` |
| `address.line1` | `string` |
| `address.line2?` | `string` |
| `address.postal_code` | `string` |
| `address.state` | `string` |
| `name` | `string` |
