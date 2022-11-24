[@bigcommerce/checkout-sdk](../README.md) / AdyenComponentEvents

# Interface: AdyenComponentEvents

## Hierarchy

- **`AdyenComponentEvents`**

  ↳ [`AdyenCreditCardComponentOptions`](AdyenCreditCardComponentOptions.md)

## Table of contents

### Methods

- [onChange](AdyenComponentEvents.md#onchange)
- [onError](AdyenComponentEvents.md#onerror)
- [onFieldValid](AdyenComponentEvents.md#onfieldvalid)

## Methods

### onChange

▸ `Optional` **onChange**(`state`, `component`): `void`

Called when the shopper enters data in the card input fields.
Here you have the option to override your main Adyen Checkout configuration.

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`AdyenComponentState`](../README.md#adyencomponentstate) |
| `component` | [`AdyenComponent`](AdyenComponent.md) |

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
| `state` | [`AdyenV2ValidationState`](AdyenV2ValidationState.md) |
| `component` | [`AdyenComponent`](AdyenComponent.md) |

#### Returns

`void`

___

### onFieldValid

▸ `Optional` **onFieldValid**(`state`, `component`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`AdyenV2ValidationState`](AdyenV2ValidationState.md) |
| `component` | [`AdyenComponent`](AdyenComponent.md) |

#### Returns

`void`
