[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / IframeEventPoster

# Class: IframeEventPoster\<TEvent, TContext\>

## Type Parameters

### TEvent

`TEvent`

### TContext

`TContext` = `undefined`

## Constructors

### Constructor

> **new IframeEventPoster**\<`TEvent`, `TContext`\>(`targetOrigin`, `_targetWindow?`, `_context?`): `IframeEventPoster`\<`TEvent`, `TContext`\>

#### Parameters

##### targetOrigin

`string`

##### \_targetWindow?

`Window`

##### \_context?

`TContext`

#### Returns

`IframeEventPoster`\<`TEvent`, `TContext`\>

## Methods

### post()

#### Call Signature

> **post**(`event`): `void`

##### Parameters

###### event

`TEvent`

##### Returns

`void`

#### Call Signature

> **post**\<`TSuccessEvent`, `TErrorEvent`\>(`event`, `options`): `Promise`\<`TSuccessEvent`\>

##### Type Parameters

###### TSuccessEvent

`TSuccessEvent` *extends* [`IframeEvent`](../interfaces/IframeEvent.md)\<`string`, `any`\> = [`IframeEvent`](../interfaces/IframeEvent.md)\<`string`, `any`\>

###### TErrorEvent

`TErrorEvent` *extends* [`IframeEvent`](../interfaces/IframeEvent.md)\<`string`, `any`\> = [`IframeEvent`](../interfaces/IframeEvent.md)\<`string`, `any`\>

##### Parameters

###### event

`TEvent`

###### options

[`IframeEventPostOptions`](../interfaces/IframeEventPostOptions.md)\<`TSuccessEvent`, `TErrorEvent`\>

##### Returns

`Promise`\<`TSuccessEvent`\>

***

### setContext()

> **setContext**(`context`): `void`

#### Parameters

##### context

`TContext`

#### Returns

`void`

***

### setTarget()

> **setTarget**(`window`): `void`

#### Parameters

##### window

`Window`

#### Returns

`void`
