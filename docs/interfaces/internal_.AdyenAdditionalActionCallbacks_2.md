[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / AdyenAdditionalActionCallbacks\_2

# Interface: AdyenAdditionalActionCallbacks\_2

[<internal>](../modules/internal_.md).AdyenAdditionalActionCallbacks_2

## Hierarchy

- **`AdyenAdditionalActionCallbacks_2`**

  ↳ [`AdyenAdditionalActionOptions_2`](internal_.AdyenAdditionalActionOptions_2.md)

## Table of contents

### Methods

- [onBeforeLoad](internal_.AdyenAdditionalActionCallbacks_2.md#onbeforeload)
- [onComplete](internal_.AdyenAdditionalActionCallbacks_2.md#oncomplete)
- [onLoad](internal_.AdyenAdditionalActionCallbacks_2.md#onload)

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
