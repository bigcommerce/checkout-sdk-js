[@bigcommerce/checkout-sdk](../README.md) / StripeShippingEvent

# Interface: StripeShippingEvent

## Hierarchy

- [`StripeEvent`](StripeEvent.md)

  ↳ **`StripeShippingEvent`**

## Table of contents

### Properties

- [complete](StripeShippingEvent.md#complete)
- [display](StripeShippingEvent.md#display)
- [elementType](StripeShippingEvent.md#elementtype)
- [empty](StripeShippingEvent.md#empty)
- [fields](StripeShippingEvent.md#fields)
- [isNewAddress](StripeShippingEvent.md#isnewaddress)
- [mode](StripeShippingEvent.md#mode)
- [phoneFieldRequired](StripeShippingEvent.md#phonefieldrequired)
- [value](StripeShippingEvent.md#value)

## Properties

### complete

• **complete**: `boolean`

#### Inherited from

[StripeEvent](StripeEvent.md).[complete](StripeEvent.md#complete)

___

### display

• `Optional` **display**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `name` | `string` |

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

### fields

• `Optional` **fields**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `phone` | `string` |

___

### isNewAddress

• `Optional` **isNewAddress**: `boolean`

___

### mode

• `Optional` **mode**: `string`

___

### phoneFieldRequired

• **phoneFieldRequired**: `boolean`

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
| `firstName?` | `string` |
| `lastName?` | `string` |
| `name?` | `string` |
| `phone?` | `string` |
