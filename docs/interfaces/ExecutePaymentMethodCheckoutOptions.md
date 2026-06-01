[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / ExecutePaymentMethodCheckoutOptions

# Interface: ExecutePaymentMethodCheckoutOptions

A set of options that are required to pass the customer step of the
current checkout flow.

Some payment methods have specific suggestion for customer to pass
the customer step. For example, Bolt suggests the customer to use
their custom checkout with prefilled form values. As a result, you
may need to provide additional information, error handler or callback
to execution method.

## Extends

- [`CustomerRequestOptions`](CustomerRequestOptions.md)

## Properties

### methodId?

> `optional` **methodId?**: `string`

#### Inherited from

[`CustomerRequestOptions`](CustomerRequestOptions.md).[`methodId`](CustomerRequestOptions.md#methodid)

***

### params?

> `optional` **params?**: `object`

The parameters of the request, if required.

#### Inherited from

[`CustomerRequestOptions`](CustomerRequestOptions.md).[`params`](CustomerRequestOptions.md#params)

***

### timeout?

> `optional` **timeout?**: `Timeout`

Provide this option if you want to cancel or time out the request. If the
timeout object completes before the request, the request will be
cancelled.

#### Inherited from

[`CustomerRequestOptions`](CustomerRequestOptions.md).[`timeout`](CustomerRequestOptions.md#timeout)

***

### version?

> `optional` **version?**: `number`

The version of the checkout, used for optimistic concurrency control.

#### Inherited from

[`CustomerRequestOptions`](CustomerRequestOptions.md).[`version`](CustomerRequestOptions.md#version)

## Methods

### checkoutPaymentMethodExecuted()?

> `optional` **checkoutPaymentMethodExecuted**(`data?`): `void`

#### Parameters

##### data?

[`CheckoutPaymentMethodExecutedOptions`](CheckoutPaymentMethodExecutedOptions.md)

#### Returns

`void`

***

### continueWithCheckoutCallback()?

> `optional` **continueWithCheckoutCallback**(): `void`

#### Returns

`void`
