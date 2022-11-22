[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / AdyenAdditionalActionCallbacks

# Interface: AdyenAdditionalActionCallbacks

[<internal>](../modules/internal_.md).AdyenAdditionalActionCallbacks

## Hierarchy

- **`AdyenAdditionalActionCallbacks`**

  ↳ [`AdyenThreeDS2Options`](internal_.AdyenThreeDS2Options.md)

  ↳ [`AdyenAdditionalActionOptions`](internal_.AdyenAdditionalActionOptions.md)

## Table of contents

### Methods

- [onBeforeLoad](internal_.AdyenAdditionalActionCallbacks.md#onbeforeload)
- [onComplete](internal_.AdyenAdditionalActionCallbacks.md#oncomplete)
- [onLoad](internal_.AdyenAdditionalActionCallbacks.md#onload)

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
