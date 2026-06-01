[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / PaymentMethodSelector

# Interface: PaymentMethodSelector

## Methods

### getLoadError()

> **getLoadError**(): `Error` \| `undefined`

#### Returns

`Error` \| `undefined`

***

### getLoadMethodError()

> **getLoadMethodError**(`methodId?`): `Error` \| `undefined`

#### Parameters

##### methodId?

`string`

#### Returns

`Error` \| `undefined`

***

### getPaymentMethod()

> **getPaymentMethod**(`methodId`, `gatewayId?`): [`PaymentMethod`](PaymentMethod.md)\<`any`\> \| `undefined`

#### Parameters

##### methodId

`string`

##### gatewayId?

`string`

#### Returns

[`PaymentMethod`](PaymentMethod.md)\<`any`\> \| `undefined`

***

### getPaymentMethodOrThrow()

> **getPaymentMethodOrThrow**(`methodId`, `gatewayId?`): [`PaymentMethod`](PaymentMethod.md)

#### Parameters

##### methodId

`string`

##### gatewayId?

`string`

#### Returns

[`PaymentMethod`](PaymentMethod.md)

***

### getPaymentMethods()

> **getPaymentMethods**(): [`PaymentMethod`](PaymentMethod.md)\<`any`\>[] \| `undefined`

#### Returns

[`PaymentMethod`](PaymentMethod.md)\<`any`\>[] \| `undefined`

***

### getPaymentMethodsMeta()

> **getPaymentMethodsMeta**(): [`PaymentMethodMeta`](PaymentMethodMeta.md) \| `undefined`

#### Returns

[`PaymentMethodMeta`](PaymentMethodMeta.md) \| `undefined`

***

### isLoading()

> **isLoading**(): `boolean`

#### Returns

`boolean`

***

### isLoadingMethod()

> **isLoadingMethod**(`methodId?`): `boolean`

#### Parameters

##### methodId?

`string`

#### Returns

`boolean`
