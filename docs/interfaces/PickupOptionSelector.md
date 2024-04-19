[@bigcommerce/checkout-sdk](../README.md) / PickupOptionSelector

# Interface: PickupOptionSelector

## Table of contents

### Methods

- [getLoadError](PickupOptionSelector.md#getloaderror)
- [getPickupOptions](PickupOptionSelector.md#getpickupoptions)
- [isLoading](PickupOptionSelector.md#isloading)

## Methods

### getLoadError

▸ **getLoadError**(): `undefined` \| `Error`

#### Returns

`undefined` \| `Error`

___

### getPickupOptions

▸ **getPickupOptions**(`consignmentId`, `searchArea`): `undefined` \| [`PickupOptionResult`](PickupOptionResult.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `consignmentId` | `string` |
| `searchArea` | [`SearchArea`](SearchArea.md) |

#### Returns

`undefined` \| [`PickupOptionResult`](PickupOptionResult.md)[]

___

### isLoading

▸ **isLoading**(): `boolean`

#### Returns

`boolean`
