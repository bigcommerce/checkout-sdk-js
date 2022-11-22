[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / AdyenComponentEvents\_2

# Interface: AdyenComponentEvents\_2

[<internal>](../modules/internal_.md).AdyenComponentEvents_2

## Hierarchy

- **`AdyenComponentEvents_2`**

  ↳ [`AdyenV3CreditCardComponentOptions`](internal_.AdyenV3CreditCardComponentOptions.md)

## Table of contents

### Methods

- [onChange](internal_.AdyenComponentEvents_2.md#onchange)
- [onError](internal_.AdyenComponentEvents_2.md#onerror)
- [onFieldValid](internal_.AdyenComponentEvents_2.md#onfieldvalid)

## Methods

### onChange

▸ `Optional` **onChange**(`state`, `component`): `void`

Called when the shopper enters data in the card input fields.
Here you have the option to override your main Adyen Checkout configuration.

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`AdyenV3ComponentState`](../modules/internal_.md#adyenv3componentstate) |
| `component` | [`AdyenComponent_2`](internal_.AdyenComponent_2.md) |

#### Returns

`void`

___

### onError

▸ `Optional` **onError**(`state`, `component`): `void`

Called in case of an invalid card number, invalid expiry date, or
 incomplete field. Called again when errors are cleared.

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`AdyenV3ValidationState`](internal_.AdyenV3ValidationState.md) |
| `component` | [`AdyenComponent_2`](internal_.AdyenComponent_2.md) |

#### Returns

`void`

___

### onFieldValid

▸ `Optional` **onFieldValid**(`state`, `component`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`AdyenV3ValidationState`](internal_.AdyenV3ValidationState.md) |
| `component` | [`AdyenComponent_2`](internal_.AdyenComponent_2.md) |

#### Returns

`void`
