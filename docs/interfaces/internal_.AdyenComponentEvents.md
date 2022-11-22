[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / AdyenComponentEvents

# Interface: AdyenComponentEvents

[<internal>](../modules/internal_.md).AdyenComponentEvents

## Hierarchy

- **`AdyenComponentEvents`**

  ↳ [`AdyenCreditCardComponentOptions`](internal_.AdyenCreditCardComponentOptions.md)

## Table of contents

### Methods

- [onChange](internal_.AdyenComponentEvents.md#onchange)
- [onError](internal_.AdyenComponentEvents.md#onerror)
- [onFieldValid](internal_.AdyenComponentEvents.md#onfieldvalid)

## Methods

### onChange

▸ `Optional` **onChange**(`state`, `component`): `void`

Called when the shopper enters data in the card input fields.
Here you have the option to override your main Adyen Checkout configuration.

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`AdyenComponentState`](../modules/internal_.md#adyencomponentstate) |
| `component` | [`AdyenComponent`](internal_.AdyenComponent.md) |

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
| `state` | [`AdyenV2ValidationState`](internal_.AdyenV2ValidationState.md) |
| `component` | [`AdyenComponent`](internal_.AdyenComponent.md) |

#### Returns

`void`

___

### onFieldValid

▸ `Optional` **onFieldValid**(`state`, `component`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`AdyenV2ValidationState`](internal_.AdyenV2ValidationState.md) |
| `component` | [`AdyenComponent`](internal_.AdyenComponent.md) |

#### Returns

`void`
