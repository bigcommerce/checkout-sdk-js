[@bigcommerce/checkout-sdk](../README.md) / AdyenAdditionalActionCallbacks

# Interface: AdyenAdditionalActionCallbacks

## Hierarchy

- **`AdyenAdditionalActionCallbacks`**

  ↳ [`AdyenAdditionalActionOptions`](AdyenAdditionalActionOptions.md)

  ↳ [`AdyenThreeDS2Options`](AdyenThreeDS2Options.md)

## Table of contents

### Methods

- [onActionHandled](AdyenAdditionalActionCallbacks.md#onactionhandled)
- [onBeforeLoad](AdyenAdditionalActionCallbacks.md#onbeforeload)
- [onComplete](AdyenAdditionalActionCallbacks.md#oncomplete)
- [onLoad](AdyenAdditionalActionCallbacks.md#onload)

## Methods

### onActionHandled

▸ `Optional` **onActionHandled**(): `void`

A callback that gets called when an action, for example a QR code or 3D Secure 2 authentication screen, is shown to the shopper

#### Returns

`void`

___

### onBeforeLoad

▸ `Optional` **onBeforeLoad**(`shopperInteraction?`): `void`

A callback that gets called before adyen component is loaded

#### Parameters

| Name | Type |
| :------ | :------ |
| `shopperInteraction?` | `boolean` |

#### Returns

`void`

___

### onComplete

▸ `Optional` **onComplete**(): `void`

A callback that gets called when adyen component verification
is completed

#### Returns

`void`

___

### onLoad

▸ `Optional` **onLoad**(`cancel?`): `void`

A callback that gets called when adyen component is loaded

#### Parameters

| Name | Type |
| :------ | :------ |
| `cancel?` | () => `void` |

#### Returns

`void`
