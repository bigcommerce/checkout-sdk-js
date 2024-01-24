[@bigcommerce/checkout-sdk](../README.md) / PaymentMethodSelector

# Interface: PaymentMethodSelector

## Table of contents

### Methods

- [getLoadError](PaymentMethodSelector.md#getloaderror)
- [getLoadMethodError](PaymentMethodSelector.md#getloadmethoderror)
- [getPaymentMethod](PaymentMethodSelector.md#getpaymentmethod)
- [getPaymentMethodOrThrow](PaymentMethodSelector.md#getpaymentmethodorthrow)
- [getPaymentMethods](PaymentMethodSelector.md#getpaymentmethods)
- [getPaymentMethodsMeta](PaymentMethodSelector.md#getpaymentmethodsmeta)
- [isLoading](PaymentMethodSelector.md#isloading)
- [isLoadingMethod](PaymentMethodSelector.md#isloadingmethod)

## Methods

### getLoadError

▸ **getLoadError**(): `undefined` \| `Error`

#### Returns

`undefined` \| `Error`

___

### getLoadMethodError

▸ **getLoadMethodError**(`methodId?`): `undefined` \| `Error`

#### Parameters

| Name | Type |
| :------ | :------ |
| `methodId?` | `string` |

#### Returns

`undefined` \| `Error`

___

### getPaymentMethod

▸ **getPaymentMethod**(`methodId`, `gatewayId?`): `undefined` \| [`PaymentMethod`](PaymentMethod.md)<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `methodId` | `string` |
| `gatewayId?` | `string` |

#### Returns

`undefined` \| [`PaymentMethod`](PaymentMethod.md)<`any`\>

___

### getPaymentMethodOrThrow

▸ **getPaymentMethodOrThrow**(`methodId`, `gatewayId?`): [`PaymentMethod`](PaymentMethod.md)<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `methodId` | `string` |
| `gatewayId?` | `string` |

#### Returns

[`PaymentMethod`](PaymentMethod.md)<`any`\>

___

### getPaymentMethods

▸ **getPaymentMethods**(): `undefined` \| [`PaymentMethod`](PaymentMethod.md)<`any`\>[]

#### Returns

`undefined` \| [`PaymentMethod`](PaymentMethod.md)<`any`\>[]

___

### getPaymentMethodsMeta

▸ **getPaymentMethodsMeta**(): `undefined` \| [`PaymentMethodMeta`](PaymentMethodMeta.md)

#### Returns

`undefined` \| [`PaymentMethodMeta`](PaymentMethodMeta.md)

___

### isLoading

▸ **isLoading**(): `boolean`

#### Returns

`boolean`

___

### isLoadingMethod

▸ **isLoadingMethod**(`methodId?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `methodId?` | `string` |

#### Returns

`boolean`
