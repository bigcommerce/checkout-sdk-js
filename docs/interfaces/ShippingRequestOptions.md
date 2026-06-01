[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / ShippingRequestOptions

# Interface: ShippingRequestOptions\<T\>

A set of options for configuring any requests related to the shipping step of
the current checkout flow.

Some payment methods have their own shipping configuration flow. Therefore,
you need to specify the method you intend to use if you want to trigger a
specific flow for setting the shipping address or option. Otherwise, these
options are not required.

## Extends

- [`RequestOptions`](RequestOptions.md)\<`T`\>

## Extended by

- [`ShippingInitializeOptions`](ShippingInitializeOptions.md)

## Type Parameters

### T

`T` = `object`

## Properties

### methodId?

> `optional` **methodId?**: `string`

***

### params?

> `optional` **params?**: `T`

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
