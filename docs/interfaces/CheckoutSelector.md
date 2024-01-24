[@bigcommerce/checkout-sdk](../README.md) / CheckoutSelector

# Interface: CheckoutSelector

## Table of contents

### Methods

- [getCheckout](CheckoutSelector.md#getcheckout)
- [getCheckoutOrThrow](CheckoutSelector.md#getcheckoutorthrow)
- [getLoadError](CheckoutSelector.md#getloaderror)
- [getOutstandingBalance](CheckoutSelector.md#getoutstandingbalance)
- [getUpdateError](CheckoutSelector.md#getupdateerror)
- [isExecutingSpamCheck](CheckoutSelector.md#isexecutingspamcheck)
- [isLoading](CheckoutSelector.md#isloading)
- [isUpdating](CheckoutSelector.md#isupdating)

## Methods

### getCheckout

▸ **getCheckout**(): `undefined` \| [`Checkout`](Checkout.md)

#### Returns

`undefined` \| [`Checkout`](Checkout.md)

___

### getCheckoutOrThrow

▸ **getCheckoutOrThrow**(): [`Checkout`](Checkout.md)

#### Returns

[`Checkout`](Checkout.md)

___

### getLoadError

▸ **getLoadError**(): `undefined` \| `Error`

#### Returns

`undefined` \| `Error`

___

### getOutstandingBalance

▸ **getOutstandingBalance**(`useStoreCredit?`): `undefined` \| `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `useStoreCredit?` | `boolean` |

#### Returns

`undefined` \| `number`

___

### getUpdateError

▸ **getUpdateError**(): `undefined` \| `Error`

#### Returns

`undefined` \| `Error`

___

### isExecutingSpamCheck

▸ **isExecutingSpamCheck**(): `boolean`

#### Returns

`boolean`

___

### isLoading

▸ **isLoading**(): `boolean`

#### Returns

`boolean`

___

### isUpdating

▸ **isUpdating**(): `boolean`

#### Returns

`boolean`
