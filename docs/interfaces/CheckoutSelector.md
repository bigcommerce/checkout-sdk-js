[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / CheckoutSelector

# Interface: CheckoutSelector

## Methods

### getCheckout()

> **getCheckout**(): [`Checkout`](Checkout.md) \| `undefined`

#### Returns

[`Checkout`](Checkout.md) \| `undefined`

***

### getCheckoutOrThrow()

> **getCheckoutOrThrow**(): [`Checkout`](Checkout.md)

#### Returns

[`Checkout`](Checkout.md)

***

### getLoadError()

> **getLoadError**(): `Error` \| `undefined`

#### Returns

`Error` \| `undefined`

***

### getOutstandingBalance()

> **getOutstandingBalance**(`useStoreCredit?`): `number` \| `undefined`

#### Parameters

##### useStoreCredit?

`boolean`

#### Returns

`number` \| `undefined`

***

### getUpdateError()

> **getUpdateError**(): `Error` \| `undefined`

#### Returns

`Error` \| `undefined`

***

### isExecutingSpamCheck()

> **isExecutingSpamCheck**(): `boolean`

#### Returns

`boolean`

***

### isLoading()

> **isLoading**(): `boolean`

#### Returns

`boolean`

***

### isUpdating()

> **isUpdating**(): `boolean`

#### Returns

`boolean`
