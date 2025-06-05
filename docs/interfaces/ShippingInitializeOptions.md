[@bigcommerce/checkout-sdk](../README.md) / ShippingInitializeOptions

# Interface: ShippingInitializeOptions<T\>

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

- [`ShippingRequestOptions`](ShippingRequestOptions.md)<`T`\>

  ↳ **`ShippingInitializeOptions`**

## Table of contents

### Properties

- [amazonpay](ShippingInitializeOptions.md#amazonpay)
- [bigcommerce_payments_fastlane](ShippingInitializeOptions.md#bigcommerce_payments_fastlane)
- [braintreefastlane](ShippingInitializeOptions.md#braintreefastlane)
- [methodId](ShippingInitializeOptions.md#methodid)
- [params](ShippingInitializeOptions.md#params)
- [paypalcommercefastlane](ShippingInitializeOptions.md#paypalcommercefastlane)
- [stripeupe](ShippingInitializeOptions.md#stripeupe)
- [timeout](ShippingInitializeOptions.md#timeout)

## Properties

### amazonpay

• `Optional` **amazonpay**: [`AmazonPayV2ShippingInitializeOptions`](AmazonPayV2ShippingInitializeOptions.md)

The options that are required to initialize the shipping step of checkout
when using AmazonPayV2.

___

### bigcommerce\_payments\_fastlane

• `Optional` **bigcommerce\_payments\_fastlane**: [`BigCommercePaymentsFastlaneShippingInitializeOptions`](BigCommercePaymentsFastlaneShippingInitializeOptions.md)

The options that are required to initialize the shipping step of checkout
when using BigCommercePayments Fastlane.

___

### braintreefastlane

• `Optional` **braintreefastlane**: [`BraintreeFastlaneShippingInitializeOptions`](BraintreeFastlaneShippingInitializeOptions.md)

The options that are required to initialize the shipping step of checkout
when using Braintree Fastlane.

___

### methodId

• `Optional` **methodId**: `string`

#### Inherited from

[ShippingRequestOptions](ShippingRequestOptions.md).[methodId](ShippingRequestOptions.md#methodid)

___

### params

• `Optional` **params**: `T`

The parameters of the request, if required.

#### Inherited from

[ShippingRequestOptions](ShippingRequestOptions.md).[params](ShippingRequestOptions.md#params)

___

### paypalcommercefastlane

• `Optional` **paypalcommercefastlane**: [`PayPalCommerceFastlaneShippingInitializeOptions`](PayPalCommerceFastlaneShippingInitializeOptions.md)

The options that are required to initialize the shipping step of checkout
when using PayPal Commerce Fastlane.

___

### stripeupe

• `Optional` **stripeupe**: [`StripeUPEShippingInitializeOptions`](StripeUPEShippingInitializeOptions.md)

The options that are required to initialize the shipping step of checkout
when using Stripe Upe Link.

___

### timeout

• `Optional` **timeout**: `default`

Provide this option if you want to cancel or time out the request. If the
timeout object completes before the request, the request will be
cancelled.

#### Inherited from

[ShippingRequestOptions](ShippingRequestOptions.md).[timeout](ShippingRequestOptions.md#timeout)
