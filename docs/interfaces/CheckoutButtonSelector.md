[@bigcommerce/checkout-sdk](../README.md) / CheckoutButtonSelector

# Interface: CheckoutButtonSelector

## Table of contents

### Methods

- [getDeinitializeError](CheckoutButtonSelector.md#getdeinitializeerror)
- [getInitializeError](CheckoutButtonSelector.md#getinitializeerror)
- [getState](CheckoutButtonSelector.md#getstate)
- [isDeinitializing](CheckoutButtonSelector.md#isdeinitializing)
- [isInitialized](CheckoutButtonSelector.md#isinitialized)
- [isInitializing](CheckoutButtonSelector.md#isinitializing)

## Methods

### getDeinitializeError

▸ **getDeinitializeError**(`methodId?`): `undefined` \| `Error`

#### Parameters

| Name | Type |
| :------ | :------ |
| `methodId?` | [`CheckoutButtonMethodType`](../enums/CheckoutButtonMethodType.md) |

#### Returns

`undefined` \| `Error`

___

### getInitializeError

▸ **getInitializeError**(`methodId?`): `undefined` \| `Error`

#### Parameters

| Name | Type |
| :------ | :------ |
| `methodId?` | [`CheckoutButtonMethodType`](../enums/CheckoutButtonMethodType.md) |

#### Returns

`undefined` \| `Error`

___

### getState

▸ **getState**(): [`CheckoutButtonState`](CheckoutButtonState.md)

#### Returns

[`CheckoutButtonState`](CheckoutButtonState.md)

___

### isDeinitializing

▸ **isDeinitializing**(`methodId?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `methodId?` | [`CheckoutButtonMethodType`](../enums/CheckoutButtonMethodType.md) |

#### Returns

`boolean`

___

### isInitialized

▸ **isInitialized**(`methodId`, `containerId?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `methodId` | [`CheckoutButtonMethodType`](../enums/CheckoutButtonMethodType.md) |
| `containerId?` | `string` |

#### Returns

`boolean`

___

### isInitializing

▸ **isInitializing**(`methodId?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `methodId?` | [`CheckoutButtonMethodType`](../enums/CheckoutButtonMethodType.md) |

#### Returns

`boolean`
