[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / AdyenAdditionalActionOptions\_2

# Interface: AdyenAdditionalActionOptions\_2

[<internal>](../modules/internal_.md).AdyenAdditionalActionOptions_2

## Hierarchy

- [`AdyenAdditionalActionCallbacks_2`](internal_.AdyenAdditionalActionCallbacks_2.md)

  ↳ **`AdyenAdditionalActionOptions_2`**

## Table of contents

### Properties

- [containerId](internal_.AdyenAdditionalActionOptions_2.md#containerid)
- [widgetSize](internal_.AdyenAdditionalActionOptions_2.md#widgetsize)

### Methods

- [onBeforeLoad](internal_.AdyenAdditionalActionOptions_2.md#onbeforeload)
- [onComplete](internal_.AdyenAdditionalActionOptions_2.md#oncomplete)
- [onLoad](internal_.AdyenAdditionalActionOptions_2.md#onload)

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

[AdyenAdditionalActionCallbacks_2](internal_.AdyenAdditionalActionCallbacks_2.md).[onBeforeLoad](internal_.AdyenAdditionalActionCallbacks_2.md#onbeforeload)

___

### onComplete

▸ `Optional` **onComplete**(): `void`

A callback that gets called when adyen component verification
is completed

#### Returns

`void`

#### Inherited from

[AdyenAdditionalActionCallbacks_2](internal_.AdyenAdditionalActionCallbacks_2.md).[onComplete](internal_.AdyenAdditionalActionCallbacks_2.md#oncomplete)

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

[AdyenAdditionalActionCallbacks_2](internal_.AdyenAdditionalActionCallbacks_2.md).[onLoad](internal_.AdyenAdditionalActionCallbacks_2.md#onload)
