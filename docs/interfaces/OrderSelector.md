[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / OrderSelector

# Interface: OrderSelector

## Methods

### getB2BReceiptId()

> **getB2BReceiptId**(): `number` \| `undefined`

#### Returns

`number` \| `undefined`

***

### getLoadError()

> **getLoadError**(): `Error` \| `undefined`

#### Returns

`Error` \| `undefined`

***

### getOrder()

> **getOrder**(): [`Order`](Order.md) \| `undefined`

#### Returns

[`Order`](Order.md) \| `undefined`

***

### getOrderMeta()

> **getOrderMeta**(): [`OrderMetaState`](OrderMetaState.md) \| `undefined`

#### Returns

[`OrderMetaState`](OrderMetaState.md) \| `undefined`

***

### getOrderOrThrow()

> **getOrderOrThrow**(): [`Order`](Order.md)

#### Returns

[`Order`](Order.md)

***

### getPaymentId()

> **getPaymentId**(`methodId`): `string` \| `undefined`

#### Parameters

##### methodId

`string`

#### Returns

`string` \| `undefined`

***

### isLoading()

> **isLoading**(): `boolean`

#### Returns

`boolean`
