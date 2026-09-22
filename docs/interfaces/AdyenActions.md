[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / AdyenActions

# Interface: AdyenActions

## Methods

### reject()

> **reject**(`error?`): `void`

Stops the payment flow. Only call this when the request to the payment provider's
API fails, or when there are network connection issues.

#### Parameters

##### error?

`unknown`

#### Returns

`void`

***

### resolve()

> **resolve**(`data?`): `void`

Continues the payment flow. Call this, passing the resultCode, even when the
payment is unsuccessful.

#### Parameters

##### data?

`unknown`

#### Returns

`void`
