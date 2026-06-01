[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / StoredCardHostedFormService

# Class: StoredCardHostedFormService

## Constructors

### Constructor

> **new StoredCardHostedFormService**(`_host`, `_hostedFormFactory`): `StoredCardHostedFormService`

#### Parameters

##### \_host

`string`

##### \_hostedFormFactory

[`HostedFormFactory`](HostedFormFactory.md)

#### Returns

`StoredCardHostedFormService`

## Methods

### deinitialize()

> **deinitialize**(): `void`

#### Returns

`void`

***

### initialize()

> **initialize**(`options`): `Promise`\<`void`\>

#### Parameters

##### options

[`LegacyHostedFormOptions`](../interfaces/LegacyHostedFormOptions.md)

#### Returns

`Promise`\<`void`\>

***

### submitStoredCard()

> **submitStoredCard**(`fields`, `data`): `Promise`\<`void`\>

#### Parameters

##### fields

[`StoredCardHostedFormInstrumentFields`](../interfaces/StoredCardHostedFormInstrumentFields.md)

##### data

[`StoredCardHostedFormData`](../interfaces/StoredCardHostedFormData.md)

#### Returns

`Promise`\<`void`\>
