[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / PaymentRequestOptions

# Interface: PaymentRequestOptions

The set of options for configuring any requests related to the payment step of
the current checkout flow.

## Extends

- [`RequestOptions`](RequestOptions.md)

## Extended by

- [`BasePaymentInitializeOptions`](BasePaymentInitializeOptions.md)

## Properties

### gatewayId?

> `optional` **gatewayId?**: `string`

The identifier of the payment provider providing the payment method. This
option is only required if the provider offers multiple payment options.
i.e.: Adyen and Klarna.

***

### methodId

> **methodId**: `string`

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
