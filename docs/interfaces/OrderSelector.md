[@bigcommerce/checkout-sdk](../README.md) / OrderSelector

# Interface: OrderSelector

## Table of contents

### Methods

- [getLoadError](OrderSelector.md#getloaderror)
- [getOrder](OrderSelector.md#getorder)
- [getOrderMeta](OrderSelector.md#getordermeta)
- [getOrderOrThrow](OrderSelector.md#getorderorthrow)
- [getPaymentId](OrderSelector.md#getpaymentid)
- [isLoading](OrderSelector.md#isloading)

## Methods

### getLoadError

▸ **getLoadError**(): `undefined` \| `Error`

#### Returns

`undefined` \| `Error`

___

### getOrder

▸ **getOrder**(): `undefined` \| [`Order`](Order.md)

#### Returns

`undefined` \| [`Order`](Order.md)

___

### getOrderMeta

▸ **getOrderMeta**(): `undefined` \| [`OrderMetaState`](OrderMetaState.md)

#### Returns

`undefined` \| [`OrderMetaState`](OrderMetaState.md)

___

### getOrderOrThrow

▸ **getOrderOrThrow**(): [`Order`](Order.md)

#### Returns

[`Order`](Order.md)

___

### getPaymentId

▸ **getPaymentId**(`methodId`): `undefined` \| `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `methodId` | `string` |

#### Returns

`undefined` \| `string`

___

### isLoading

▸ **isLoading**(): `boolean`

#### Returns

`boolean`
