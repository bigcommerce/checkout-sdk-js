[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / RequestOptions

# Interface: RequestOptions\<TParams\>

A set of options for configuring an asynchronous request.

## Extended by

- [`CheckoutButtonOptions`](CheckoutButtonOptions.md)
- [`CustomerRequestOptions`](CustomerRequestOptions.md)
- [`OrderFinalizeOptions`](OrderFinalizeOptions.md)
- [`PaymentRequestOptions`](PaymentRequestOptions.md)
- [`ShippingRequestOptions`](ShippingRequestOptions.md)

## Type Parameters

### TParams

`TParams` = `object`

## Properties

### params?

> `optional` **params?**: `TParams`

The parameters of the request, if required.

***

### timeout?

> `optional` **timeout?**: `Timeout`

Provide this option if you want to cancel or time out the request. If the
timeout object completes before the request, the request will be
cancelled.

***

### version?

> `optional` **version?**: `number`

The version of the checkout, used for optimistic concurrency control.
