[@bigcommerce/checkout-sdk](../README.md) / ShippingRequestOptions

# Interface: ShippingRequestOptions<T\>

A set of options for configuring any requests related to the shipping step of
the current checkout flow.

Some payment methods have their own shipping configuration flow. Therefore,
you need to specify the method you intend to use if you want to trigger a
specific flow for setting the shipping address or option. Otherwise, these
options are not required.

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | {} |

## Hierarchy

- [`RequestOptions`](RequestOptions.md)<`T`\>

  ↳ **`ShippingRequestOptions`**

  ↳↳ [`ShippingInitializeOptions`](ShippingInitializeOptions.md)

## Table of contents

### Properties

- [methodId](ShippingRequestOptions.md#methodid)
- [params](ShippingRequestOptions.md#params)
- [timeout](ShippingRequestOptions.md#timeout)

## Properties

### methodId

• `Optional` **methodId**: `string`

___

### params

• `Optional` **params**: `T`

The parameters of the request, if required.

#### Inherited from

[RequestOptions](RequestOptions.md).[params](RequestOptions.md#params)

___

### timeout

• `Optional` **timeout**: `default`

Provide this option if you want to cancel or time out the request. If the
timeout object completes before the request, the request will be
cancelled.

#### Inherited from

[RequestOptions](RequestOptions.md).[timeout](RequestOptions.md#timeout)
