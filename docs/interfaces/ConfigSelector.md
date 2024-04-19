[@bigcommerce/checkout-sdk](../README.md) / ConfigSelector

# Interface: ConfigSelector

## Table of contents

### Methods

- [getConfig](ConfigSelector.md#getconfig)
- [getContextConfig](ConfigSelector.md#getcontextconfig)
- [getExternalSource](ConfigSelector.md#getexternalsource)
- [getFlashMessages](ConfigSelector.md#getflashmessages)
- [getHost](ConfigSelector.md#gethost)
- [getLoadError](ConfigSelector.md#getloaderror)
- [getLocale](ConfigSelector.md#getlocale)
- [getStoreConfig](ConfigSelector.md#getstoreconfig)
- [getStoreConfigOrThrow](ConfigSelector.md#getstoreconfigorthrow)
- [getVariantIdentificationToken](ConfigSelector.md#getvariantidentificationtoken)
- [isLoading](ConfigSelector.md#isloading)

## Methods

### getConfig

▸ **getConfig**(): `undefined` \| [`Config`](Config.md)

#### Returns

`undefined` \| [`Config`](Config.md)

___

### getContextConfig

▸ **getContextConfig**(): `undefined` \| [`ContextConfig`](ContextConfig.md)

#### Returns

`undefined` \| [`ContextConfig`](ContextConfig.md)

___

### getExternalSource

▸ **getExternalSource**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

___

### getFlashMessages

▸ **getFlashMessages**(`type?`): `undefined` \| [`FlashMessage`](FlashMessage.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `type?` | ``"error"`` \| ``"info"`` \| ``"warning"`` \| ``"success"`` |

#### Returns

`undefined` \| [`FlashMessage`](FlashMessage.md)[]

___

### getHost

▸ **getHost**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

___

### getLoadError

▸ **getLoadError**(): `undefined` \| `Error`

#### Returns

`undefined` \| `Error`

___

### getLocale

▸ **getLocale**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

___

### getStoreConfig

▸ **getStoreConfig**(): `undefined` \| [`StoreConfig`](StoreConfig.md)

#### Returns

`undefined` \| [`StoreConfig`](StoreConfig.md)

___

### getStoreConfigOrThrow

▸ **getStoreConfigOrThrow**(): [`StoreConfig`](StoreConfig.md)

#### Returns

[`StoreConfig`](StoreConfig.md)

___

### getVariantIdentificationToken

▸ **getVariantIdentificationToken**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

___

### isLoading

▸ **isLoading**(): `boolean`

#### Returns

`boolean`
