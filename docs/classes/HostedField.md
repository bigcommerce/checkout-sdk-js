[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / HostedField

# Class: HostedField

## Constructors

### Constructor

> **new HostedField**(`_type`, `_containerId`, `_placeholder`, `_accessibilityLabel`, `_styles`, `_eventPoster`, `_eventListener`, `_detachmentObserver`, `_checkoutId?`, `_cardInstrument?`): `HostedField`

#### Parameters

##### \_type

[`HostedFieldType`](../enumerations/HostedFieldType.md)

##### \_containerId

`string`

##### \_placeholder

`string`

##### \_accessibilityLabel

`string`

##### \_styles

[`HostedFieldStylesMap`](../interfaces/HostedFieldStylesMap.md)

##### \_eventPoster

[`IframeEventPoster`](IframeEventPoster.md)\<[`HostedFieldEvent`](../type-aliases/HostedFieldEvent.md)\>

##### \_eventListener

[`IframeEventListener`](IframeEventListener.md)\<[`HostedInputEventMap`](../interfaces/HostedInputEventMap.md)\>

##### \_detachmentObserver

[`DetachmentObserver`](DetachmentObserver.md)

##### \_checkoutId?

`string`

##### \_cardInstrument?

[`CardInstrument`](../interfaces/CardInstrument.md)

#### Returns

`HostedField`

## Methods

### attach()

> **attach**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### detach()

> **detach**(): `void`

#### Returns

`void`

***

### getType()

> **getType**(): [`HostedFieldType`](../enumerations/HostedFieldType.md)

#### Returns

[`HostedFieldType`](../enumerations/HostedFieldType.md)

***

### submitForm()

> **submitForm**(`fields`, `data`): `Promise`\<[`HostedInputSubmitSuccessEvent`](../interfaces/HostedInputSubmitSuccessEvent.md)\>

#### Parameters

##### fields

[`HostedFieldType`](../enumerations/HostedFieldType.md)[]

##### data

[`HostedFormOrderData`](../interfaces/HostedFormOrderData.md)

#### Returns

`Promise`\<[`HostedInputSubmitSuccessEvent`](../interfaces/HostedInputSubmitSuccessEvent.md)\>

***

### submitStoredCardForm()

> **submitStoredCardForm**(`fields`, `data`): `Promise`\<[`HostedInputStoredCardSucceededEvent`](../interfaces/HostedInputStoredCardSucceededEvent.md)\>

#### Parameters

##### fields

[`StoredCardHostedFormInstrumentFields`](../interfaces/StoredCardHostedFormInstrumentFields.md)

##### data

[`StoredCardHostedFormData`](../interfaces/StoredCardHostedFormData.md)

#### Returns

`Promise`\<[`HostedInputStoredCardSucceededEvent`](../interfaces/HostedInputStoredCardSucceededEvent.md)\>

***

### validateForm()

> **validateForm**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>
