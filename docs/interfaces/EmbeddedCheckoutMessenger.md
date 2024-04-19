[@bigcommerce/checkout-sdk](../README.md) / EmbeddedCheckoutMessenger

# Interface: EmbeddedCheckoutMessenger

## Table of contents

### Methods

- [postComplete](EmbeddedCheckoutMessenger.md#postcomplete)
- [postError](EmbeddedCheckoutMessenger.md#posterror)
- [postFrameError](EmbeddedCheckoutMessenger.md#postframeerror)
- [postFrameLoaded](EmbeddedCheckoutMessenger.md#postframeloaded)
- [postLoaded](EmbeddedCheckoutMessenger.md#postloaded)
- [postSignedOut](EmbeddedCheckoutMessenger.md#postsignedout)
- [receiveStyles](EmbeddedCheckoutMessenger.md#receivestyles)

## Methods

### postComplete

▸ **postComplete**(): `void`

#### Returns

`void`

___

### postError

▸ **postError**(`payload`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | `Error` \| [`CustomError`](CustomError.md) |

#### Returns

`void`

___

### postFrameError

▸ **postFrameError**(`payload`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | `Error` \| [`CustomError`](CustomError.md) |

#### Returns

`void`

___

### postFrameLoaded

▸ **postFrameLoaded**(`payload?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`EmbeddedContentOptions`](EmbeddedContentOptions.md) |

#### Returns

`void`

___

### postLoaded

▸ **postLoaded**(): `void`

#### Returns

`void`

___

### postSignedOut

▸ **postSignedOut**(): `void`

#### Returns

`void`

___

### receiveStyles

▸ **receiveStyles**(`handler`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `handler` | (`styles`: [`EmbeddedCheckoutStyles`](EmbeddedCheckoutStyles.md)) => `void` |

#### Returns

`void`
