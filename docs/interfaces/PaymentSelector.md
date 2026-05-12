[@bigcommerce/checkout-sdk](../README.md) / PaymentSelector

# Interface: PaymentSelector

## Table of contents

### Methods

- [getPaymentId](PaymentSelector.md#getpaymentid)
- [getPaymentIdOrThrow](PaymentSelector.md#getpaymentidorthrow)
- [getPaymentRedirectUrl](PaymentSelector.md#getpaymentredirecturl)
- [getPaymentRedirectUrlOrThrow](PaymentSelector.md#getpaymentredirecturlorthrow)
- [getPaymentStatus](PaymentSelector.md#getpaymentstatus)
- [getPaymentStatusOrThrow](PaymentSelector.md#getpaymentstatusorthrow)
- [getPaymentToken](PaymentSelector.md#getpaymenttoken)
- [getPaymentTokenOrThrow](PaymentSelector.md#getpaymenttokenorthrow)
- [isPaymentDataRequired](PaymentSelector.md#ispaymentdatarequired)
- [isPaymentDataSubmitted](PaymentSelector.md#ispaymentdatasubmitted)

## Methods

### getPaymentId

▸ **getPaymentId**(): `undefined` \| \{ `gatewayId?`: `string` ; `providerId`: `string`  }

#### Returns

`undefined` \| \{ `gatewayId?`: `string` ; `providerId`: `string`  }

___

### getPaymentIdOrThrow

▸ **getPaymentIdOrThrow**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `gatewayId?` | `string` |
| `providerId` | `string` |

___

### getPaymentRedirectUrl

▸ **getPaymentRedirectUrl**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

___

### getPaymentRedirectUrlOrThrow

▸ **getPaymentRedirectUrlOrThrow**(): `string`

#### Returns

`string`

___

### getPaymentStatus

▸ **getPaymentStatus**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

___

### getPaymentStatusOrThrow

▸ **getPaymentStatusOrThrow**(): `string`

#### Returns

`string`

___

### getPaymentToken

▸ **getPaymentToken**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

___

### getPaymentTokenOrThrow

▸ **getPaymentTokenOrThrow**(): `string`

#### Returns

`string`

___

### isPaymentDataRequired

▸ **isPaymentDataRequired**(`useStoreCredit?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `useStoreCredit?` | `boolean` |

#### Returns

`boolean`

___

### isPaymentDataSubmitted

▸ **isPaymentDataSubmitted**(`paymentMethod?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `paymentMethod?` | [`PaymentMethod`](PaymentMethod.md)\<`any`\> |

#### Returns

`boolean`
