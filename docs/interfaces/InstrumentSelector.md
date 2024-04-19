[@bigcommerce/checkout-sdk](../README.md) / InstrumentSelector

# Interface: InstrumentSelector

## Table of contents

### Methods

- [getCardInstrument](InstrumentSelector.md#getcardinstrument)
- [getCardInstrumentOrThrow](InstrumentSelector.md#getcardinstrumentorthrow)
- [getDeleteError](InstrumentSelector.md#getdeleteerror)
- [getInstruments](InstrumentSelector.md#getinstruments)
- [getInstrumentsByPaymentMethod](InstrumentSelector.md#getinstrumentsbypaymentmethod)
- [getInstrumentsMeta](InstrumentSelector.md#getinstrumentsmeta)
- [getLoadError](InstrumentSelector.md#getloaderror)
- [isDeleting](InstrumentSelector.md#isdeleting)
- [isLoading](InstrumentSelector.md#isloading)

## Methods

### getCardInstrument

▸ **getCardInstrument**(`instrumentId`): `undefined` \| [`CardInstrument`](CardInstrument.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `instrumentId` | `string` |

#### Returns

`undefined` \| [`CardInstrument`](CardInstrument.md)

___

### getCardInstrumentOrThrow

▸ **getCardInstrumentOrThrow**(`instrumentId`): [`CardInstrument`](CardInstrument.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `instrumentId` | `string` |

#### Returns

[`CardInstrument`](CardInstrument.md)

___

### getDeleteError

▸ **getDeleteError**(`instrumentId?`): `undefined` \| `Error`

#### Parameters

| Name | Type |
| :------ | :------ |
| `instrumentId?` | `string` |

#### Returns

`undefined` \| `Error`

___

### getInstruments

▸ **getInstruments**(): `undefined` \| [`PaymentInstrument`](../README.md#paymentinstrument)[]

#### Returns

`undefined` \| [`PaymentInstrument`](../README.md#paymentinstrument)[]

___

### getInstrumentsByPaymentMethod

▸ **getInstrumentsByPaymentMethod**(`paymentMethod`): `undefined` \| [`PaymentInstrument`](../README.md#paymentinstrument)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `paymentMethod` | [`PaymentMethod`](PaymentMethod.md)<`any`\> |

#### Returns

`undefined` \| [`PaymentInstrument`](../README.md#paymentinstrument)[]

___

### getInstrumentsMeta

▸ **getInstrumentsMeta**(): `undefined` \| [`VaultAccessToken`](VaultAccessToken.md)

#### Returns

`undefined` \| [`VaultAccessToken`](VaultAccessToken.md)

___

### getLoadError

▸ **getLoadError**(): `undefined` \| `Error`

#### Returns

`undefined` \| `Error`

___

### isDeleting

▸ **isDeleting**(`instrumentId?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `instrumentId?` | `string` |

#### Returns

`boolean`

___

### isLoading

▸ **isLoading**(): `boolean`

#### Returns

`boolean`
