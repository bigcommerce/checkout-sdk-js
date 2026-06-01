[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / BodlService

# Interface: BodlService

## Methods

### checkoutBegin()

> **checkoutBegin**(): `void`

#### Returns

`void`

***

### clickPayButton()

> **clickPayButton**(`payload?`): `void`

#### Parameters

##### payload?

[`BodlEventsPayload`](BodlEventsPayload.md)

#### Returns

`void`

***

### customerEmailEntry()

> **customerEmailEntry**(`email?`): `void`

#### Parameters

##### email?

`string`

#### Returns

`void`

***

### customerPaymentMethodExecuted()

> **customerPaymentMethodExecuted**(`payload?`): `void`

#### Parameters

##### payload?

[`BodlEventsPayload`](BodlEventsPayload.md)

#### Returns

`void`

***

### customerSuggestionExecute()

> **customerSuggestionExecute**(): `void`

#### Returns

`void`

***

### customerSuggestionInit()

> **customerSuggestionInit**(`payload?`): `void`

#### Parameters

##### payload?

[`BodlEventsPayload`](BodlEventsPayload.md)

#### Returns

`void`

***

### exitCheckout()

> **exitCheckout**(): `void`

#### Returns

`void`

***

### orderPurchased()

> **orderPurchased**(): `void`

#### Returns

`void`

***

### paymentComplete()

> **paymentComplete**(): `void`

#### Returns

`void`

***

### paymentRejected()

> **paymentRejected**(): `void`

#### Returns

`void`

***

### selectedPaymentMethod()

> **selectedPaymentMethod**(`methodName?`): `void`

#### Parameters

##### methodName?

`string`

#### Returns

`void`

***

### showShippingMethods()

> **showShippingMethods**(): `void`

#### Returns

`void`

***

### stepCompleted()

> **stepCompleted**(`step?`): `void`

#### Parameters

##### step?

`string`

#### Returns

`void`
