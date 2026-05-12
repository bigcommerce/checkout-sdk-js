[@bigcommerce/checkout-sdk](../README.md) / GoogleRecaptcha

# Class: GoogleRecaptcha

## Table of contents

### Constructors

- [constructor](GoogleRecaptcha.md#constructor)

### Methods

- [execute](GoogleRecaptcha.md#execute)
- [load](GoogleRecaptcha.md#load)
- [reset](GoogleRecaptcha.md#reset)

## Constructors

### constructor

• **new GoogleRecaptcha**(`googleRecaptchaScriptLoader`, `mutationObserverFactory`): [`GoogleRecaptcha`](GoogleRecaptcha.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `googleRecaptchaScriptLoader` | [`GoogleRecaptchaScriptLoader`](GoogleRecaptchaScriptLoader.md) |
| `mutationObserverFactory` | [`MutationObserverFactory`](MutationObserverFactory.md) |

#### Returns

[`GoogleRecaptcha`](GoogleRecaptcha.md)

## Methods

### execute

▸ **execute**(): `Observable`\<[`RecaptchaResult`](../interfaces/RecaptchaResult.md)\>

#### Returns

`Observable`\<[`RecaptchaResult`](../interfaces/RecaptchaResult.md)\>

___

### load

▸ **load**(`containerId`, `sitekey`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `containerId` | `string` |
| `sitekey` | `string` |

#### Returns

`Promise`\<`void`\>

___

### reset

▸ **reset**(`containerId`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `containerId` | `string` |

#### Returns

`void`
