[@bigcommerce/checkout-sdk](../README.md) / HostedForm

# Class: HostedForm

## Implements

- `HostedForm`

## Table of contents

### Constructors

- [constructor](HostedForm.md#constructor)

### Methods

- [attach](HostedForm.md#attach)
- [detach](HostedForm.md#detach)
- [getBin](HostedForm.md#getbin)
- [getCardType](HostedForm.md#getcardtype)
- [submit](HostedForm.md#submit)
- [submitStoredCard](HostedForm.md#submitstoredcard)
- [validate](HostedForm.md#validate)

## Constructors

### constructor

• **new HostedForm**(`_fields`, `_eventListener`, `_payloadTransformer`, `_eventCallbacks`, `_paymentHumanVerificationHandler`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `_fields` | [`HostedField`](HostedField.md)[] |
| `_eventListener` | [`IframeEventListener`](IframeEventListener.md)<[`HostedInputEventMap`](../interfaces/HostedInputEventMap.md), `undefined`\> |
| `_payloadTransformer` | [`HostedFormOrderDataTransformer`](HostedFormOrderDataTransformer.md) |
| `_eventCallbacks` | [`HostedFormEventCallbacks`](../README.md#hostedformeventcallbacks) |
| `_paymentHumanVerificationHandler` | [`PaymentHumanVerificationHandler`](PaymentHumanVerificationHandler.md) |

## Methods

### attach

▸ **attach**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Implementation of

HostedFormInterface.attach

___

### detach

▸ **detach**(): `void`

#### Returns

`void`

#### Implementation of

HostedFormInterface.detach

___

### getBin

▸ **getBin**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

#### Implementation of

HostedFormInterface.getBin

___

### getCardType

▸ **getCardType**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

#### Implementation of

HostedFormInterface.getCardType

___

### submit

▸ **submit**(`payload`, `additionalActionData?`): `Promise`<[`HostedInputSubmitSuccessEvent`](../interfaces/HostedInputSubmitSuccessEvent.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | [`OrderPaymentRequestBody`](../interfaces/OrderPaymentRequestBody.md) |
| `additionalActionData?` | [`PaymentAdditionalAction`](../interfaces/PaymentAdditionalAction.md) |

#### Returns

`Promise`<[`HostedInputSubmitSuccessEvent`](../interfaces/HostedInputSubmitSuccessEvent.md)\>

#### Implementation of

HostedFormInterface.submit

___

### submitStoredCard

▸ **submitStoredCard**(`payload`): `Promise`<`void` \| [`HostedInputStoredCardSucceededEvent`](../interfaces/HostedInputStoredCardSucceededEvent.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | `Object` |
| `payload.data` | [`StoredCardHostedFormData`](../interfaces/StoredCardHostedFormData.md) |
| `payload.fields` | [`StoredCardHostedFormInstrumentFields`](../interfaces/StoredCardHostedFormInstrumentFields.md) |

#### Returns

`Promise`<`void` \| [`HostedInputStoredCardSucceededEvent`](../interfaces/HostedInputStoredCardSucceededEvent.md)\>

___

### validate

▸ **validate**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Implementation of

HostedFormInterface.validate
