[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / CheckoutButtonSelector

# Interface: CheckoutButtonSelector

## Methods

### getDeinitializeError()

> **getDeinitializeError**(`methodId?`): `Error` \| `undefined`

#### Parameters

##### methodId?

[`CheckoutButtonMethodType`](../enumerations/CheckoutButtonMethodType.md)

#### Returns

`Error` \| `undefined`

***

### getInitializeError()

> **getInitializeError**(`methodId?`): `Error` \| `undefined`

#### Parameters

##### methodId?

[`CheckoutButtonMethodType`](../enumerations/CheckoutButtonMethodType.md)

#### Returns

`Error` \| `undefined`

***

### getState()

> **getState**(): [`CheckoutButtonState`](CheckoutButtonState.md)

#### Returns

[`CheckoutButtonState`](CheckoutButtonState.md)

***

### isDeinitializing()

> **isDeinitializing**(`methodId?`): `boolean`

#### Parameters

##### methodId?

[`CheckoutButtonMethodType`](../enumerations/CheckoutButtonMethodType.md)

#### Returns

`boolean`

***

### isInitialized()

> **isInitialized**(`methodId`, `containerId?`): `boolean`

#### Parameters

##### methodId

[`CheckoutButtonMethodType`](../enumerations/CheckoutButtonMethodType.md)

##### containerId?

`string`

#### Returns

`boolean`

***

### isInitializing()

> **isInitializing**(`methodId?`): `boolean`

#### Parameters

##### methodId?

[`CheckoutButtonMethodType`](../enumerations/CheckoutButtonMethodType.md)

#### Returns

`boolean`
