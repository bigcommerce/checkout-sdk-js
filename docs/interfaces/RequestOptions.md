[@bigcommerce/checkout-sdk](../README.md) / RequestOptions

# Interface: RequestOptions<TParams\>

A set of options for configuring an asynchronous request.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TParams` | {} |

## Hierarchy

- **`RequestOptions`**

  ↳ [`CheckoutButtonOptions_2`](CheckoutButtonOptions_2.md)

  ↳ [`CustomerRequestOptions_2`](CustomerRequestOptions_2.md)

  ↳ [`PaymentRequestOptions_2`](PaymentRequestOptions_2.md)

  ↳ [`ShippingRequestOptions`](ShippingRequestOptions.md)

## Table of contents

### Properties

- [params](RequestOptions.md#params)
- [timeout](RequestOptions.md#timeout)

## Properties

### params

• `Optional` **params**: `TParams`

The parameters of the request, if required.

___

### timeout

• `Optional` **timeout**: `default`

Provide this option if you want to cancel or time out the request. If the
timeout object completes before the request, the request will be
cancelled.
