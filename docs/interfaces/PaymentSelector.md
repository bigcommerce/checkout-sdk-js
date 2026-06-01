[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / PaymentSelector

# Interface: PaymentSelector

## Methods

### getPaymentId()

> **getPaymentId**(): \{ `gatewayId?`: `string`; `providerId`: `string`; \} \| `undefined`

#### Returns

\{ `gatewayId?`: `string`; `providerId`: `string`; \} \| `undefined`

***

### getPaymentIdOrThrow()

> **getPaymentIdOrThrow**(): `object`

#### Returns

`object`

##### gatewayId?

> `optional` **gatewayId?**: `string`

##### providerId

> **providerId**: `string`

***

### getPaymentRedirectUrl()

> **getPaymentRedirectUrl**(): `string` \| `undefined`

#### Returns

`string` \| `undefined`

***

### getPaymentRedirectUrlOrThrow()

> **getPaymentRedirectUrlOrThrow**(): `string`

#### Returns

`string`

***

### getPaymentStatus()

> **getPaymentStatus**(): `string` \| `undefined`

#### Returns

`string` \| `undefined`

***

### getPaymentStatusOrThrow()

> **getPaymentStatusOrThrow**(): `string`

#### Returns

`string`

***

### getPaymentToken()

> **getPaymentToken**(): `string` \| `undefined`

#### Returns

`string` \| `undefined`

***

### getPaymentTokenOrThrow()

> **getPaymentTokenOrThrow**(): `string`

#### Returns

`string`

***

### isPaymentDataRequired()

> **isPaymentDataRequired**(`useStoreCredit?`): `boolean`

#### Parameters

##### useStoreCredit?

`boolean`

#### Returns

`boolean`

***

### isPaymentDataSubmitted()

> **isPaymentDataSubmitted**(`paymentMethod?`): `boolean`

#### Parameters

##### paymentMethod?

[`PaymentMethod`](PaymentMethod.md)\<`any`\>

#### Returns

`boolean`
