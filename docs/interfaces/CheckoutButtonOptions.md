[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / CheckoutButtonOptions

# Interface: CheckoutButtonOptions

The set of options for configuring the checkout button.

## Extends

- [`RequestOptions`](RequestOptions.md)

## Extended by

- [`BaseCheckoutButtonInitializeOptions`](BaseCheckoutButtonInitializeOptions.md)

## Properties

### methodId

> **methodId**: [`CheckoutButtonMethodType`](../enumerations/CheckoutButtonMethodType.md)

The identifier of the payment method.

***

### params?

> `optional` **params?**: `object`

The parameters of the request, if required.

#### Inherited from

[`RequestOptions`](RequestOptions.md).[`params`](RequestOptions.md#params)

***

### timeout?

> `optional` **timeout?**: `Timeout`

Provide this option if you want to cancel or time out the request. If the
timeout object completes before the request, the request will be
cancelled.

#### Inherited from

[`RequestOptions`](RequestOptions.md).[`timeout`](RequestOptions.md#timeout)

***

### version?

> `optional` **version?**: `number`

The version of the checkout, used for optimistic concurrency control.

#### Inherited from

[`RequestOptions`](RequestOptions.md).[`version`](RequestOptions.md#version)
