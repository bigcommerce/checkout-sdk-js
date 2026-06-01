[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / HostedForm

# Class: HostedForm

## Implements

- `HostedForm`

## Constructors

### Constructor

> **new HostedForm**(`_fields`, `_eventListener`, `_payloadTransformer`, `_eventCallbacks`, `_paymentHumanVerificationHandler`): `HostedForm`

#### Parameters

##### \_fields

[`HostedField`](HostedField.md)[]

##### \_eventListener

[`IframeEventListener`](IframeEventListener.md)\<[`HostedInputEventMap`](../interfaces/HostedInputEventMap.md)\>

##### \_payloadTransformer

[`HostedFormOrderDataTransformer`](HostedFormOrderDataTransformer.md)

##### \_eventCallbacks

[`HostedFormEventCallbacks`](../type-aliases/HostedFormEventCallbacks.md)

##### \_paymentHumanVerificationHandler

[`PaymentHumanVerificationHandler`](PaymentHumanVerificationHandler.md)

#### Returns

`HostedForm`

## Methods

### attach()

> **attach**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Implementation of

`HostedFormInterface.attach`

***

### detach()

> **detach**(): `void`

#### Returns

`void`

#### Implementation of

`HostedFormInterface.detach`

***

### getBin()

> **getBin**(): `string` \| `undefined`

#### Returns

`string` \| `undefined`

#### Implementation of

`HostedFormInterface.getBin`

***

### getCardType()

> **getCardType**(): `string` \| `undefined`

#### Returns

`string` \| `undefined`

#### Implementation of

`HostedFormInterface.getCardType`

***

### submit()

> **submit**(`payload`, `additionalActionData?`): `Promise`\<[`HostedInputSubmitSuccessEvent`](../interfaces/HostedInputSubmitSuccessEvent.md)\>

#### Parameters

##### payload

[`OrderPaymentRequestBody`](../interfaces/OrderPaymentRequestBody.md)

##### additionalActionData?

[`PaymentAdditionalAction`](../interfaces/PaymentAdditionalAction.md)

#### Returns

`Promise`\<[`HostedInputSubmitSuccessEvent`](../interfaces/HostedInputSubmitSuccessEvent.md)\>

#### Implementation of

`HostedFormInterface.submit`

***

### submitStoredCard()

> **submitStoredCard**(`payload`): `Promise`\<`void` \| [`HostedInputStoredCardSucceededEvent`](../interfaces/HostedInputStoredCardSucceededEvent.md)\>

#### Parameters

##### payload

###### data

[`StoredCardHostedFormData`](../interfaces/StoredCardHostedFormData.md)

###### fields

[`StoredCardHostedFormInstrumentFields`](../interfaces/StoredCardHostedFormInstrumentFields.md)

#### Returns

`Promise`\<`void` \| [`HostedInputStoredCardSucceededEvent`](../interfaces/HostedInputStoredCardSucceededEvent.md)\>

***

### validate()

> **validate**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Implementation of

`HostedFormInterface.validate`
