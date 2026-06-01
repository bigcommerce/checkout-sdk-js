[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / PaymentStrategySelector

# Interface: PaymentStrategySelector

## Methods

### getExecuteError()

> **getExecuteError**(`methodId?`): `Error` \| `undefined`

#### Parameters

##### methodId?

`string`

#### Returns

`Error` \| `undefined`

***

### getFinalizeError()

> **getFinalizeError**(`methodId?`): `Error` \| `undefined`

#### Parameters

##### methodId?

`string`

#### Returns

`Error` \| `undefined`

***

### getInitializeError()

> **getInitializeError**(`methodId?`): `Error` \| `undefined`

#### Parameters

##### methodId?

`string`

#### Returns

`Error` \| `undefined`

***

### getWidgetInteractingError()

> **getWidgetInteractingError**(`methodId?`): `Error` \| `undefined`

#### Parameters

##### methodId?

`string`

#### Returns

`Error` \| `undefined`

***

### isExecuting()

> **isExecuting**(`methodId?`): `boolean`

#### Parameters

##### methodId?

`string`

#### Returns

`boolean`

***

### isFinalizing()

> **isFinalizing**(`methodId?`): `boolean`

#### Parameters

##### methodId?

`string`

#### Returns

`boolean`

***

### isInitialized()

> **isInitialized**(`query`): `boolean`

#### Parameters

##### query

[`InitiaizedQuery`](InitiaizedQuery.md)

#### Returns

`boolean`

***

### isInitializing()

> **isInitializing**(`methodId?`): `boolean`

#### Parameters

##### methodId?

`string`

#### Returns

`boolean`

***

### isWidgetInteracting()

> **isWidgetInteracting**(`methodId?`): `boolean`

#### Parameters

##### methodId?

`string`

#### Returns

`boolean`
