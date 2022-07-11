[@bigcommerce/checkout-sdk](../README.md) / AdyenAdditionalActionCallbacks

# Interface: AdyenAdditionalActionCallbacks

## Hierarchy

- **`AdyenAdditionalActionCallbacks`**

  ↳ [`AdyenAdditionalActionOptions`](AdyenAdditionalActionOptions.md)

  ↳ [`AdyenThreeDS2Options`](AdyenThreeDS2Options.md)

## Table of contents

### Methods

- [onBeforeLoad](AdyenAdditionalActionCallbacks.md#onbeforeload)
- [onComplete](AdyenAdditionalActionCallbacks.md#oncomplete)
- [onLoad](AdyenAdditionalActionCallbacks.md#onload)

## Methods

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
