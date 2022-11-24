[@bigcommerce/checkout-sdk](../README.md) / AdyenComponentEvents_2

# Interface: AdyenComponentEvents\_2

## Hierarchy

- **`AdyenComponentEvents_2`**

  ↳ [`AdyenV3CreditCardComponentOptions`](AdyenV3CreditCardComponentOptions.md)

## Table of contents

### Methods

- [onChange](AdyenComponentEvents_2.md#onchange)
- [onError](AdyenComponentEvents_2.md#onerror)
- [onFieldValid](AdyenComponentEvents_2.md#onfieldvalid)

## Methods

### onChange

▸ `Optional` **onChange**(`state`, `component`): `void`

Called when the shopper enters data in the card input fields.
Here you have the option to override your main Adyen Checkout configuration.

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`AdyenV3ComponentState`](../README.md#adyenv3componentstate) |
| `component` | [`AdyenComponent_2`](AdyenComponent_2.md) |

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
| `state` | [`AdyenV3ValidationState`](AdyenV3ValidationState.md) |
| `component` | [`AdyenComponent_2`](AdyenComponent_2.md) |

#### Returns

`void`

___

### onFieldValid

▸ `Optional` **onFieldValid**(`state`, `component`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`AdyenV3ValidationState`](AdyenV3ValidationState.md) |
| `component` | [`AdyenComponent_2`](AdyenComponent_2.md) |

#### Returns

`void`
