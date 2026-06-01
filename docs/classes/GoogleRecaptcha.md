[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / GoogleRecaptcha

# Class: GoogleRecaptcha

## Constructors

### Constructor

> **new GoogleRecaptcha**(`googleRecaptchaScriptLoader`, `mutationObserverFactory`): `GoogleRecaptcha`

#### Parameters

##### googleRecaptchaScriptLoader

[`GoogleRecaptchaScriptLoader`](GoogleRecaptchaScriptLoader.md)

##### mutationObserverFactory

[`MutationObserverFactory`](MutationObserverFactory.md)

#### Returns

`GoogleRecaptcha`

## Methods

### execute()

> **execute**(): `Observable`\<[`RecaptchaResult`](../interfaces/RecaptchaResult.md)\>

#### Returns

`Observable`\<[`RecaptchaResult`](../interfaces/RecaptchaResult.md)\>

***

### load()

> **load**(`containerId`, `sitekey`): `Promise`\<`void`\>

#### Parameters

##### containerId

`string`

##### sitekey

`string`

#### Returns

`Promise`\<`void`\>

***

### reset()

> **reset**(`containerId`): `void`

#### Parameters

##### containerId

`string`

#### Returns

`void`
