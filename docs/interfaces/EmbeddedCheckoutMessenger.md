[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / EmbeddedCheckoutMessenger

# Interface: EmbeddedCheckoutMessenger

## Methods

### postComplete()

> **postComplete**(): `void`

#### Returns

`void`

***

### postError()

> **postError**(`payload`): `void`

#### Parameters

##### payload

`Error` \| [`CustomError`](CustomError.md)

#### Returns

`void`

***

### postFrameError()

> **postFrameError**(`payload`): `void`

#### Parameters

##### payload

`Error` \| [`CustomError`](CustomError.md)

#### Returns

`void`

***

### postFrameLoaded()

> **postFrameLoaded**(`payload?`): `void`

#### Parameters

##### payload?

[`EmbeddedContentOptions`](EmbeddedContentOptions.md)

#### Returns

`void`

***

### postLoaded()

> **postLoaded**(): `void`

#### Returns

`void`

***

### postSignedOut()

> **postSignedOut**(): `void`

#### Returns

`void`

***

### receiveStyles()

> **receiveStyles**(`handler`): `void`

#### Parameters

##### handler

(`styles`) => `void`

#### Returns

`void`
