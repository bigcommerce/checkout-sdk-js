[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / EmbeddedCheckoutOptions

# Interface: EmbeddedCheckoutOptions

[<internal>](../modules/internal_.md).EmbeddedCheckoutOptions

## Table of contents

### Properties

- [containerId](internal_.EmbeddedCheckoutOptions.md#containerid)
- [styles](internal_.EmbeddedCheckoutOptions.md#styles)
- [url](internal_.EmbeddedCheckoutOptions.md#url)

### Methods

- [onComplete](internal_.EmbeddedCheckoutOptions.md#oncomplete)
- [onError](internal_.EmbeddedCheckoutOptions.md#onerror)
- [onFrameError](internal_.EmbeddedCheckoutOptions.md#onframeerror)
- [onFrameLoad](internal_.EmbeddedCheckoutOptions.md#onframeload)
- [onLoad](internal_.EmbeddedCheckoutOptions.md#onload)
- [onSignOut](internal_.EmbeddedCheckoutOptions.md#onsignout)

## Properties

### containerId

• **containerId**: `string`

___

### styles

• `Optional` **styles**: [`EmbeddedCheckoutStyles`](internal_.EmbeddedCheckoutStyles.md)

___

### url

• **url**: `string`

## Methods

### onComplete

▸ `Optional` **onComplete**(`event`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`EmbeddedCheckoutCompleteEvent`](internal_.EmbeddedCheckoutCompleteEvent.md) |

#### Returns

`void`

___

### onError

▸ `Optional` **onError**(`event`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`EmbeddedCheckoutErrorEvent`](internal_.EmbeddedCheckoutErrorEvent.md) |

#### Returns

`void`

___

### onFrameError

▸ `Optional` **onFrameError**(`event`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`EmbeddedCheckoutFrameErrorEvent`](internal_.EmbeddedCheckoutFrameErrorEvent.md) |

#### Returns

`void`

___

### onFrameLoad

▸ `Optional` **onFrameLoad**(`event`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`EmbeddedCheckoutFrameLoadedEvent`](internal_.EmbeddedCheckoutFrameLoadedEvent.md) |

#### Returns

`void`

___

### onLoad

▸ `Optional` **onLoad**(`event`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`EmbeddedCheckoutLoadedEvent`](internal_.EmbeddedCheckoutLoadedEvent.md) |

#### Returns

`void`

___

### onSignOut

▸ `Optional` **onSignOut**(`event`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`EmbeddedCheckoutSignedOutEvent`](internal_.EmbeddedCheckoutSignedOutEvent.md) |

#### Returns

`void`
