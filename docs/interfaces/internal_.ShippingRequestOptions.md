[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / ShippingRequestOptions

# Interface: ShippingRequestOptions<T\>

[<internal>](../modules/internal_.md).ShippingRequestOptions

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

- [`RequestOptions`](internal_.RequestOptions.md)<`T`\>

  ↳ **`ShippingRequestOptions`**

  ↳↳ [`ShippingInitializeOptions`](internal_.ShippingInitializeOptions.md)

## Table of contents

### Properties

- [methodId](internal_.ShippingRequestOptions.md#methodid)
- [params](internal_.ShippingRequestOptions.md#params)
- [timeout](internal_.ShippingRequestOptions.md#timeout)

## Properties

### methodId

• `Optional` **methodId**: `string`

___

### params

• `Optional` **params**: `T`

The parameters of the request, if required.

#### Inherited from

[RequestOptions](internal_.RequestOptions.md).[params](internal_.RequestOptions.md#params)

___

### timeout

• `Optional` **timeout**: `default`

Provide this option if you want to cancel or time out the request. If the
timeout object completes before the request, the request will be
cancelled.

#### Inherited from

[RequestOptions](internal_.RequestOptions.md).[timeout](internal_.RequestOptions.md#timeout)
