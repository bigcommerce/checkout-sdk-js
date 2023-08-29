[@bigcommerce/checkout-sdk](../README.md) / AdyenThreeDS2Options

# Interface: AdyenThreeDS2Options

## Hierarchy

- [`AdyenAdditionalActionCallbacks`](AdyenAdditionalActionCallbacks.md)

  ↳ **`AdyenThreeDS2Options`**

## Table of contents

### Properties

- [widgetSize](AdyenThreeDS2Options.md#widgetsize)

### Methods

- [onBeforeLoad](AdyenThreeDS2Options.md#onbeforeload)
- [onComplete](AdyenThreeDS2Options.md#oncomplete)
- [onLoad](AdyenThreeDS2Options.md#onload)

## Properties

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

[AdyenAdditionalActionCallbacks](AdyenAdditionalActionCallbacks.md).[onBeforeLoad](AdyenAdditionalActionCallbacks.md#onbeforeload)

___

### onComplete

▸ `Optional` **onComplete**(): `void`

A callback that gets called when adyen component verification
is completed

#### Returns

`void`

#### Inherited from

[AdyenAdditionalActionCallbacks](AdyenAdditionalActionCallbacks.md).[onComplete](AdyenAdditionalActionCallbacks.md#oncomplete)

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

[AdyenAdditionalActionCallbacks](AdyenAdditionalActionCallbacks.md).[onLoad](AdyenAdditionalActionCallbacks.md#onload)
