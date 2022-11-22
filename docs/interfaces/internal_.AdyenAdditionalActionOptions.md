[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / AdyenAdditionalActionOptions

# Interface: AdyenAdditionalActionOptions

[<internal>](../modules/internal_.md).AdyenAdditionalActionOptions

## Hierarchy

- [`AdyenAdditionalActionCallbacks`](internal_.AdyenAdditionalActionCallbacks.md)

  ↳ **`AdyenAdditionalActionOptions`**

## Table of contents

### Properties

- [containerId](internal_.AdyenAdditionalActionOptions.md#containerid)
- [widgetSize](internal_.AdyenAdditionalActionOptions.md#widgetsize)

### Methods

- [onBeforeLoad](internal_.AdyenAdditionalActionOptions.md#onbeforeload)
- [onComplete](internal_.AdyenAdditionalActionOptions.md#oncomplete)
- [onLoad](internal_.AdyenAdditionalActionOptions.md#onload)

## Properties

### containerId

• **containerId**: `string`

The location to insert the additional action component.

___

### widgetSize

• `Optional` **widgetSize**: `string`

Specify Three3DS2Challenge Widget Size

Values
'01' = 250px x 400px
'02' = 390px x 400px
'03' = 500px x 600px
'04' = 600px x 400px
'05' = 100% x 100%

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

#### Inherited from

[AdyenAdditionalActionCallbacks](internal_.AdyenAdditionalActionCallbacks.md).[onBeforeLoad](internal_.AdyenAdditionalActionCallbacks.md#onbeforeload)

___

### onComplete

▸ `Optional` **onComplete**(): `void`

A callback that gets called when adyen component verification
is completed

#### Returns

`void`

#### Inherited from

[AdyenAdditionalActionCallbacks](internal_.AdyenAdditionalActionCallbacks.md).[onComplete](internal_.AdyenAdditionalActionCallbacks.md#oncomplete)

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

#### Inherited from

[AdyenAdditionalActionCallbacks](internal_.AdyenAdditionalActionCallbacks.md).[onLoad](internal_.AdyenAdditionalActionCallbacks.md#onload)
