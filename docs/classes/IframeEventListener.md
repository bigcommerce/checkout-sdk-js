[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / IframeEventListener

# Class: IframeEventListener\<TEventMap, TContext\>

## Type Parameters

### TEventMap

`TEventMap` *extends* [`IframeEventMap`](../type-aliases/IframeEventMap.md)\<keyof `TEventMap`\>

### TContext

`TContext` = `undefined`

## Constructors

### Constructor

> **new IframeEventListener**\<`TEventMap`, `TContext`\>(`sourceOrigin`): `IframeEventListener`\<`TEventMap`, `TContext`\>

#### Parameters

##### sourceOrigin

`string`

#### Returns

`IframeEventListener`\<`TEventMap`, `TContext`\>

## Methods

### addListener()

> **addListener**\<`TType`\>(`type`, `listener`): `void`

#### Type Parameters

##### TType

`TType` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### type

`TType`

##### listener

(`event`, `context?`) => `void`

#### Returns

`void`

***

### listen()

> **listen**(): `void`

#### Returns

`void`

***

### removeListener()

> **removeListener**\<`TType`\>(`type`, `listener`): `void`

#### Type Parameters

##### TType

`TType` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### type

`TType`

##### listener

(`event`, `context?`) => `void`

#### Returns

`void`

***

### stopListen()

> **stopListen**(): `void`

#### Returns

`void`

***

### trigger()

> **trigger**\<`TType`\>(`event`, `context?`): `void`

#### Type Parameters

##### TType

`TType` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### event

`TEventMap`\[`TType`\]

##### context?

`TContext`

#### Returns

`void`
