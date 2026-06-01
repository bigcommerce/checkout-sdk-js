[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / createBodlService

# Function: createBodlService()

> **createBodlService**(`subscribe`): [`BodlService`](../interfaces/BodlService.md)

Creates an instance of `BodlService`.

## Parameters

### subscribe

(`subscriber`) => `void`

The callback function, what get a subscriber as a property, that subscribes to state changes.

## Returns

[`BodlService`](../interfaces/BodlService.md)

an instance of `BodlService`.

## Remarks

```js
const bodlService = BodlService();
bodlService.checkoutBegin();

```
