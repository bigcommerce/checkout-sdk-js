[@bigcommerce/checkout-sdk](../README.md) / RequestOptions_2

# Interface: RequestOptions\_2<TParams\>

A set of options for configuring an asynchronous request.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TParams` | {} |

## Hierarchy

- **`RequestOptions_2`**

  ↳ [`CheckoutButtonOptions`](CheckoutButtonOptions.md)

  ↳ [`PaymentRequestOptions`](PaymentRequestOptions.md)

## Table of contents

### Properties

- [params](RequestOptions_2.md#params)
- [timeout](RequestOptions_2.md#timeout)

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
