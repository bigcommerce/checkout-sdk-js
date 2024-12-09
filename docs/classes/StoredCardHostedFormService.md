[@bigcommerce/checkout-sdk](../README.md) / StoredCardHostedFormService

# Class: StoredCardHostedFormService

## Table of contents

### Constructors

- [constructor](StoredCardHostedFormService.md#constructor)

### Methods

- [deinitialize](StoredCardHostedFormService.md#deinitialize)
- [initialize](StoredCardHostedFormService.md#initialize)
- [submitStoredCard](StoredCardHostedFormService.md#submitstoredcard)

## Constructors

### constructor

• **new StoredCardHostedFormService**(`_host`, `_hostedFormFactory`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `_host` | `string` |
| `_hostedFormFactory` | [`HostedFormFactory`](HostedFormFactory.md) |

## Methods

### deinitialize

▸ **deinitialize**(): `void`

#### Returns

`void`

___

### initialize

▸ **initialize**(`options`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`LegacyHostedFormOptions`](../interfaces/LegacyHostedFormOptions.md) |

#### Returns

`Promise`<`void`\>

___

### submitStoredCard

▸ **submitStoredCard**(`fields`, `data`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `fields` | [`StoredCardHostedFormInstrumentFields`](../interfaces/StoredCardHostedFormInstrumentFields.md) |
| `data` | [`StoredCardHostedFormData`](../interfaces/StoredCardHostedFormData.md) |

#### Returns

`Promise`<`void`\>
