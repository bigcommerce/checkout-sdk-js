[@bigcommerce/checkout-sdk](../README.md) / HostedField

# Class: HostedField

## Table of contents

### Constructors

- [constructor](HostedField.md#constructor)

### Methods

- [attach](HostedField.md#attach)
- [detach](HostedField.md#detach)
- [getType](HostedField.md#gettype)
- [submitForm](HostedField.md#submitform)
- [submitStoredCardForm](HostedField.md#submitstoredcardform)
- [validateForm](HostedField.md#validateform)

## Constructors

### constructor

• **new HostedField**(`_type`, `_containerId`, `_placeholder`, `_accessibilityLabel`, `_styles`, `_eventPoster`, `_eventListener`, `_detachmentObserver`, `_checkoutId?`, `_cardInstrument?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `_type` | [`HostedFieldType`](../enums/HostedFieldType.md) |
| `_containerId` | `string` |
| `_placeholder` | `string` |
| `_accessibilityLabel` | `string` |
| `_styles` | [`HostedFieldStylesMap`](../interfaces/HostedFieldStylesMap.md) |
| `_eventPoster` | [`IframeEventPoster`](IframeEventPoster.md)<[`HostedFieldEvent`](../README.md#hostedfieldevent), `undefined`\> |
| `_eventListener` | [`IframeEventListener`](IframeEventListener.md)<[`HostedInputEventMap`](../interfaces/HostedInputEventMap.md), `undefined`\> |
| `_detachmentObserver` | [`DetachmentObserver`](DetachmentObserver.md) |
| `_checkoutId?` | `string` |
| `_cardInstrument?` | [`CardInstrument`](../interfaces/CardInstrument.md) |

## Methods

### attach

▸ **attach**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

___

### detach

▸ **detach**(): `void`

#### Returns

`void`

___

### getType

▸ **getType**(): [`HostedFieldType`](../enums/HostedFieldType.md)

#### Returns

[`HostedFieldType`](../enums/HostedFieldType.md)

___

### submitForm

▸ **submitForm**(`fields`, `data`): `Promise`<[`HostedInputSubmitSuccessEvent`](../interfaces/HostedInputSubmitSuccessEvent.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `fields` | [`HostedFieldType`](../enums/HostedFieldType.md)[] |
| `data` | [`HostedFormOrderData`](../interfaces/HostedFormOrderData.md) |

#### Returns

`Promise`<[`HostedInputSubmitSuccessEvent`](../interfaces/HostedInputSubmitSuccessEvent.md)\>

___

### submitStoredCardForm

▸ **submitStoredCardForm**(`fields`, `data`): `Promise`<[`HostedInputStoredCardSucceededEvent`](../interfaces/HostedInputStoredCardSucceededEvent.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `fields` | [`StoredCardHostedFormInstrumentFields`](../interfaces/StoredCardHostedFormInstrumentFields.md) |
| `data` | [`StoredCardHostedFormData`](../interfaces/StoredCardHostedFormData.md) |

#### Returns

`Promise`<[`HostedInputStoredCardSucceededEvent`](../interfaces/HostedInputStoredCardSucceededEvent.md)\>

___

### validateForm

▸ **validateForm**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>
