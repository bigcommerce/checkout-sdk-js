[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / RequestOptions

# Interface: RequestOptions<TParams\>

[<internal>](../modules/internal_.md).RequestOptions

A set of options for configuring an asynchronous request.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TParams` | {} |

## Hierarchy

- **`RequestOptions`**

  ↳ [`PaymentRequestOptions`](internal_.PaymentRequestOptions.md)

  ↳ [`CustomerRequestOptions`](internal_.CustomerRequestOptions.md)

  ↳ [`ShippingRequestOptions`](internal_.ShippingRequestOptions.md)

## Table of contents

### Properties

- [params](internal_.RequestOptions.md#params)
- [timeout](internal_.RequestOptions.md#timeout)

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
