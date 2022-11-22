[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / ShippingInitializeOptions

# Interface: ShippingInitializeOptions<T\>

[<internal>](../modules/internal_.md).ShippingInitializeOptions

A set of options that are required to initialize the shipping step of the
current checkout flow.

Some payment methods have specific requirements for setting the shipping
details for checkout. For example, Amazon Pay requires the customer to enter
their shipping address using their address book widget. As a result, you may
need to provide additional information in order to initialize the shipping
step of checkout.

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | {} |

## Hierarchy

- [`ShippingRequestOptions`](internal_.ShippingRequestOptions.md)<`T`\>

  ↳ **`ShippingInitializeOptions`**

## Table of contents

### Properties

- [amazon](internal_.ShippingInitializeOptions.md#amazon)
- [amazonpay](internal_.ShippingInitializeOptions.md#amazonpay)
- [methodId](internal_.ShippingInitializeOptions.md#methodid)
- [params](internal_.ShippingInitializeOptions.md#params)
- [stripeupe](internal_.ShippingInitializeOptions.md#stripeupe)
- [timeout](internal_.ShippingInitializeOptions.md#timeout)

## Properties

### amazon

• `Optional` **amazon**: [`AmazonPayShippingInitializeOptions`](internal_.AmazonPayShippingInitializeOptions.md)

The options that are required to initialize the shipping step of checkout
when using Amazon Pay.

___

### amazonpay

• `Optional` **amazonpay**: [`AmazonPayV2ShippingInitializeOptions`](internal_.AmazonPayV2ShippingInitializeOptions.md)

The options that are required to initialize the shipping step of checkout
when using AmazonPayV2.

___

### methodId

• `Optional` **methodId**: `string`

#### Inherited from

[ShippingRequestOptions](internal_.ShippingRequestOptions.md).[methodId](internal_.ShippingRequestOptions.md#methodid)

___

### params

• `Optional` **params**: `T`

The parameters of the request, if required.

#### Inherited from

[ShippingRequestOptions](internal_.ShippingRequestOptions.md).[params](internal_.ShippingRequestOptions.md#params)

___

### stripeupe

• `Optional` **stripeupe**: [`StripeUPEShippingInitializeOptions`](internal_.StripeUPEShippingInitializeOptions.md)

The options that are required to initialize the shipping step of checkout
when using Stripe Upe Link.

___

### timeout

• `Optional` **timeout**: `default`

Provide this option if you want to cancel or time out the request. If the
timeout object completes before the request, the request will be
cancelled.

#### Inherited from

[ShippingRequestOptions](internal_.ShippingRequestOptions.md).[timeout](internal_.ShippingRequestOptions.md#timeout)
