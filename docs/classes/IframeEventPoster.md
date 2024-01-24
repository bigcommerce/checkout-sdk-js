[@bigcommerce/checkout-sdk](../README.md) / IframeEventPoster

# Class: IframeEventPoster<TEvent, TContext\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TEvent` | `TEvent` |
| `TContext` | `undefined` |

## Table of contents

### Constructors

- [constructor](IframeEventPoster.md#constructor)

### Methods

- [post](IframeEventPoster.md#post)
- [setContext](IframeEventPoster.md#setcontext)
- [setTarget](IframeEventPoster.md#settarget)

## Constructors

### constructor

• **new IframeEventPoster**<`TEvent`, `TContext`\>(`targetOrigin`, `_targetWindow?`, `_context?`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEvent` | `TEvent` |
| `TContext` | `undefined` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `targetOrigin` | `string` |
| `_targetWindow?` | `Window` |
| `_context?` | `TContext` |

## Methods

### post

▸ **post**(`event`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `TEvent` |

#### Returns

`void`

▸ **post**<`TSuccessEvent`, `TErrorEvent`\>(`event`, `options`): `Promise`<`TSuccessEvent`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TSuccessEvent` | extends [`IframeEvent`](../interfaces/IframeEvent.md)<`string`, `any`, `TSuccessEvent`\>[`IframeEvent`](../interfaces/IframeEvent.md)<`string`, `any`\> |
| `TErrorEvent` | extends [`IframeEvent`](../interfaces/IframeEvent.md)<`string`, `any`, `TErrorEvent`\>[`IframeEvent`](../interfaces/IframeEvent.md)<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `TEvent` |
| `options` | [`IframeEventPostOptions`](../interfaces/IframeEventPostOptions.md)<`TSuccessEvent`, `TErrorEvent`\> |

#### Returns

`Promise`<`TSuccessEvent`\>

___

### setContext

▸ **setContext**(`context`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `context` | `TContext` |

#### Returns

`void`

___

### setTarget

▸ **setTarget**(`window`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `window` | `Window` |

#### Returns

`void`
