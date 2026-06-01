[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / EmbeddedCheckoutOptions

# Interface: EmbeddedCheckoutOptions

## Properties

### containerId

> **containerId**: `string`

***

### styles?

> `optional` **styles?**: [`EmbeddedCheckoutStyles`](EmbeddedCheckoutStyles.md)

***

### url

> **url**: `string`

## Methods

### onComplete()?

> `optional` **onComplete**(`event`): `void`

#### Parameters

##### event

[`EmbeddedCheckoutCompleteEvent`](EmbeddedCheckoutCompleteEvent.md)

#### Returns

`void`

***

### onError()?

> `optional` **onError**(`event`): `void`

#### Parameters

##### event

[`EmbeddedCheckoutErrorEvent`](EmbeddedCheckoutErrorEvent.md)

#### Returns

`void`

***

### onFrameError()?

> `optional` **onFrameError**(`event`): `void`

#### Parameters

##### event

[`EmbeddedCheckoutFrameErrorEvent`](EmbeddedCheckoutFrameErrorEvent.md)

#### Returns

`void`

***

### onFrameLoad()?

> `optional` **onFrameLoad**(`event`): `void`

#### Parameters

##### event

[`EmbeddedCheckoutFrameLoadedEvent`](EmbeddedCheckoutFrameLoadedEvent.md)

#### Returns

`void`

***

### onLoad()?

> `optional` **onLoad**(`event`): `void`

#### Parameters

##### event

[`EmbeddedCheckoutLoadedEvent`](EmbeddedCheckoutLoadedEvent.md)

#### Returns

`void`

***

### onSignOut()?

> `optional` **onSignOut**(`event`): `void`

#### Parameters

##### event

[`EmbeddedCheckoutSignedOutEvent`](EmbeddedCheckoutSignedOutEvent.md)

#### Returns

`void`
