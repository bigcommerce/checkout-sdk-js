[@bigcommerce/checkout-sdk](../README.md) / EmbeddedCheckoutOptions

# Interface: EmbeddedCheckoutOptions

## Table of contents

### Properties

- [containerId](EmbeddedCheckoutOptions.md#containerid)
- [styles](EmbeddedCheckoutOptions.md#styles)
- [url](EmbeddedCheckoutOptions.md#url)

### Methods

- [onComplete](EmbeddedCheckoutOptions.md#oncomplete)
- [onError](EmbeddedCheckoutOptions.md#onerror)
- [onFrameError](EmbeddedCheckoutOptions.md#onframeerror)
- [onFrameLoad](EmbeddedCheckoutOptions.md#onframeload)
- [onLoad](EmbeddedCheckoutOptions.md#onload)
- [onSignOut](EmbeddedCheckoutOptions.md#onsignout)

## Properties

### containerId

• **containerId**: `string`

___

### styles

• `Optional` **styles**: [`EmbeddedCheckoutStyles`](EmbeddedCheckoutStyles.md)

___

### url

• **url**: `string`

## Methods

### onComplete

▸ `Optional` **onComplete**(`event`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`EmbeddedCheckoutCompleteEvent`](EmbeddedCheckoutCompleteEvent.md) |

#### Returns

`void`

___

### onError

▸ `Optional` **onError**(`event`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`EmbeddedCheckoutErrorEvent`](EmbeddedCheckoutErrorEvent.md) |

#### Returns

`void`

___

### onFrameError

▸ `Optional` **onFrameError**(`event`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`EmbeddedCheckoutFrameErrorEvent`](EmbeddedCheckoutFrameErrorEvent.md) |

#### Returns

`void`

___

### onFrameLoad

▸ `Optional` **onFrameLoad**(`event`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`EmbeddedCheckoutFrameLoadedEvent`](EmbeddedCheckoutFrameLoadedEvent.md) |

#### Returns

`void`

___

### onLoad

▸ `Optional` **onLoad**(`event`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`EmbeddedCheckoutLoadedEvent`](EmbeddedCheckoutLoadedEvent.md) |

#### Returns

`void`

___

### onSignOut

▸ `Optional` **onSignOut**(`event`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`EmbeddedCheckoutSignedOutEvent`](EmbeddedCheckoutSignedOutEvent.md) |

#### Returns

`void`
