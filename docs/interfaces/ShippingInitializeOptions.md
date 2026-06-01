[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / ShippingInitializeOptions

# Interface: ShippingInitializeOptions\<T\>

A set of options that are required to initialize the shipping step of the
current checkout flow.

Some payment methods have specific requirements for setting the shipping
details for checkout. For example, Amazon Pay requires the customer to enter
their shipping address using their address book widget. As a result, you may
need to provide additional information in order to initialize the shipping
step of checkout.

## Extends

- [`ShippingRequestOptions`](ShippingRequestOptions.md)\<`T`\>

## Type Parameters

### T

`T` = `object`

## Properties

### amazonpay?

> `optional` **amazonpay?**: [`AmazonPayV2ShippingInitializeOptions`](AmazonPayV2ShippingInitializeOptions.md)

The options that are required to initialize the shipping step of checkout
when using AmazonPayV2.

***

### bigcommerce\_payments\_fastlane?

> `optional` **bigcommerce\_payments\_fastlane?**: [`BigCommercePaymentsFastlaneShippingInitializeOptions`](BigCommercePaymentsFastlaneShippingInitializeOptions.md)

The options that are required to initialize the shipping step of checkout
when using BigCommercePayments Fastlane.

***

### braintreefastlane?

> `optional` **braintreefastlane?**: [`BraintreeFastlaneShippingInitializeOptions`](BraintreeFastlaneShippingInitializeOptions.md)

The options that are required to initialize the shipping step of checkout
when using Braintree Fastlane.

***

### fastlane?

> `optional` **fastlane?**: [`FastlaneShippingInitializeOptions`](FastlaneShippingInitializeOptions.md)

The options that are required to initialize the shipping step of checkout
when using Fastlane (PayPal Commerce, BigCommerce Payments, or Braintree).

This is a unified option that works across all Fastlane implementations,
simplifying integration and avoiding provider-specific checks.

***

### methodId?

> `optional` **methodId?**: `string`

#### Inherited from

[`ShippingRequestOptions`](ShippingRequestOptions.md).[`methodId`](ShippingRequestOptions.md#methodid)

***

### params?

> `optional` **params?**: `T`

The parameters of the request, if required.

#### Inherited from

[`ShippingRequestOptions`](ShippingRequestOptions.md).[`params`](ShippingRequestOptions.md#params)

***

### paypalcommercefastlane?

> `optional` **paypalcommercefastlane?**: [`PayPalCommerceFastlaneShippingInitializeOptions`](PayPalCommerceFastlaneShippingInitializeOptions.md)

The options that are required to initialize the shipping step of checkout
when using PayPal Commerce Fastlane.

***

### stripeupe?

> `optional` **stripeupe?**: [`StripeUPEShippingInitializeOptions`](StripeUPEShippingInitializeOptions.md)

The options that are required to initialize the shipping step of checkout
when using Stripe Upe Link.

***

### timeout?

> `optional` **timeout?**: `Timeout`

Provide this option if you want to cancel or time out the request. If the
timeout object completes before the request, the request will be
cancelled.

#### Inherited from

[`ShippingRequestOptions`](ShippingRequestOptions.md).[`timeout`](ShippingRequestOptions.md#timeout)

***

### version?

> `optional` **version?**: `number`

The version of the checkout, used for optimistic concurrency control.

#### Inherited from

[`ShippingRequestOptions`](ShippingRequestOptions.md).[`version`](ShippingRequestOptions.md#version)
