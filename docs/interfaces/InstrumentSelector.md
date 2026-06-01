[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / InstrumentSelector

# Interface: InstrumentSelector

## Methods

### getCardInstrument()

> **getCardInstrument**(`instrumentId`): [`CardInstrument`](CardInstrument.md) \| `undefined`

#### Parameters

##### instrumentId

`string`

#### Returns

[`CardInstrument`](CardInstrument.md) \| `undefined`

***

### getCardInstrumentOrThrow()

> **getCardInstrumentOrThrow**(`instrumentId`): [`CardInstrument`](CardInstrument.md)

#### Parameters

##### instrumentId

`string`

#### Returns

[`CardInstrument`](CardInstrument.md)

***

### getDeleteError()

> **getDeleteError**(`instrumentId?`): `Error` \| `undefined`

#### Parameters

##### instrumentId?

`string`

#### Returns

`Error` \| `undefined`

***

### getInstruments()

> **getInstruments**(): [`PaymentInstrument`](../type-aliases/PaymentInstrument.md)[] \| `undefined`

#### Returns

[`PaymentInstrument`](../type-aliases/PaymentInstrument.md)[] \| `undefined`

***

### getInstrumentsByPaymentMethod()

> **getInstrumentsByPaymentMethod**(`paymentMethod`): [`PaymentInstrument`](../type-aliases/PaymentInstrument.md)[] \| `undefined`

#### Parameters

##### paymentMethod

[`PaymentMethod`](PaymentMethod.md)

#### Returns

[`PaymentInstrument`](../type-aliases/PaymentInstrument.md)[] \| `undefined`

***

### getInstrumentsMeta()

> **getInstrumentsMeta**(): [`VaultAccessToken`](VaultAccessToken.md) \| `undefined`

#### Returns

[`VaultAccessToken`](VaultAccessToken.md) \| `undefined`

***

### getLoadError()

> **getLoadError**(): `Error` \| `undefined`

#### Returns

`Error` \| `undefined`

***

### isDeleting()

> **isDeleting**(`instrumentId?`): `boolean`

#### Parameters

##### instrumentId?

`string`

#### Returns

`boolean`

***

### isLoading()

> **isLoading**(): `boolean`

#### Returns

`boolean`
