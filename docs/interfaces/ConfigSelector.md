[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / ConfigSelector

# Interface: ConfigSelector

## Methods

### getConfig()

> **getConfig**(): [`Config`](Config.md) \| `undefined`

#### Returns

[`Config`](Config.md) \| `undefined`

***

### getContextConfig()

> **getContextConfig**(): [`ContextConfig`](ContextConfig.md) \| `undefined`

#### Returns

[`ContextConfig`](ContextConfig.md) \| `undefined`

***

### getExternalSource()

> **getExternalSource**(): `string` \| `undefined`

#### Returns

`string` \| `undefined`

***

### getFlashMessages()

> **getFlashMessages**(`type?`): [`FlashMessage`](FlashMessage.md)[] \| `undefined`

#### Parameters

##### type?

[`FlashMessageType`](../type-aliases/FlashMessageType.md)

#### Returns

[`FlashMessage`](FlashMessage.md)[] \| `undefined`

***

### getHost()

> **getHost**(): `string` \| `undefined`

#### Returns

`string` \| `undefined`

***

### getLoadError()

> **getLoadError**(): `Error` \| `undefined`

#### Returns

`Error` \| `undefined`

***

### getLocale()

> **getLocale**(): `string` \| `undefined`

#### Returns

`string` \| `undefined`

***

### getStoreConfig()

> **getStoreConfig**(): [`StoreConfig`](StoreConfig.md) \| `undefined`

#### Returns

[`StoreConfig`](StoreConfig.md) \| `undefined`

***

### getStoreConfigOrThrow()

> **getStoreConfigOrThrow**(): [`StoreConfig`](StoreConfig.md)

#### Returns

[`StoreConfig`](StoreConfig.md)

***

### getVariantIdentificationToken()

> **getVariantIdentificationToken**(): `string` \| `undefined`

#### Returns

`string` \| `undefined`

***

### isLoading()

> **isLoading**(): `boolean`

#### Returns

`boolean`
