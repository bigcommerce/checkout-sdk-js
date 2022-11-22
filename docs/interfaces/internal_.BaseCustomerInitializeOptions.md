[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / BaseCustomerInitializeOptions

# Interface: BaseCustomerInitializeOptions

[<internal>](../modules/internal_.md).BaseCustomerInitializeOptions

A set of options that are required to initialize the customer step of the
current checkout flow.

Some payment methods have specific requirements for setting the customer
details for checkout. For example, Amazon Pay requires the customer to sign in
using their sign-in button. As a result, you may need to provide additional
information in order to initialize the customer step of checkout.

## Hierarchy

- [`CustomerRequestOptions`](internal_.CustomerRequestOptions.md)

  ↳ **`BaseCustomerInitializeOptions`**

## Indexable

▪ [key: `string`]: `unknown`

## Table of contents

### Properties

- [amazon](internal_.BaseCustomerInitializeOptions.md#amazon)
- [amazonpay](internal_.BaseCustomerInitializeOptions.md#amazonpay)
- [bolt](internal_.BaseCustomerInitializeOptions.md#bolt)
- [braintreevisacheckout](internal_.BaseCustomerInitializeOptions.md#braintreevisacheckout)
- [chasepay](internal_.BaseCustomerInitializeOptions.md#chasepay)
- [googlepayadyenv2](internal_.BaseCustomerInitializeOptions.md#googlepayadyenv2)
- [googlepayadyenv3](internal_.BaseCustomerInitializeOptions.md#googlepayadyenv3)
- [googlepayauthorizenet](internal_.BaseCustomerInitializeOptions.md#googlepayauthorizenet)
- [googlepaybnz](internal_.BaseCustomerInitializeOptions.md#googlepaybnz)
- [googlepaybraintree](internal_.BaseCustomerInitializeOptions.md#googlepaybraintree)
- [googlepaycheckoutcom](internal_.BaseCustomerInitializeOptions.md#googlepaycheckoutcom)
- [googlepaycybersourcev2](internal_.BaseCustomerInitializeOptions.md#googlepaycybersourcev2)
- [googlepayorbital](internal_.BaseCustomerInitializeOptions.md#googlepayorbital)
- [googlepaystripe](internal_.BaseCustomerInitializeOptions.md#googlepaystripe)
- [googlepaystripeupe](internal_.BaseCustomerInitializeOptions.md#googlepaystripeupe)
- [masterpass](internal_.BaseCustomerInitializeOptions.md#masterpass)
- [methodId](internal_.BaseCustomerInitializeOptions.md#methodid)
- [params](internal_.BaseCustomerInitializeOptions.md#params)
- [stripeupe](internal_.BaseCustomerInitializeOptions.md#stripeupe)
- [timeout](internal_.BaseCustomerInitializeOptions.md#timeout)

## Properties

### amazon

• `Optional` **amazon**: [`AmazonPayCustomerInitializeOptions`](internal_.AmazonPayCustomerInitializeOptions.md)

The options that are required to initialize the customer step of checkout
when using Amazon Pay.

___

### amazonpay

• `Optional` **amazonpay**: [`AmazonPayV2CustomerInitializeOptions`](internal_.AmazonPayV2CustomerInitializeOptions.md)

The options that are required to initialize the customer step of checkout
when using AmazonPayV2.

___

### bolt

• `Optional` **bolt**: [`BoltCustomerInitializeOptions`](internal_.BoltCustomerInitializeOptions.md)

The options that are required to initialize the customer step of checkout
when using Bolt.

___

### braintreevisacheckout

• `Optional` **braintreevisacheckout**: [`BraintreeVisaCheckoutCustomerInitializeOptions`](internal_.BraintreeVisaCheckoutCustomerInitializeOptions.md)

The options that are required to initialize the customer step of checkout
when using Visa Checkout provided by Braintree.

___

### chasepay

• `Optional` **chasepay**: [`ChasePayCustomerInitializeOptions`](internal_.ChasePayCustomerInitializeOptions.md)

The options that are required to initialize the Chasepay payment method.
They can be omitted unless you need to support Chasepay.

___

### googlepayadyenv2

• `Optional` **googlepayadyenv2**: [`GooglePayCustomerInitializeOptions`](internal_.GooglePayCustomerInitializeOptions.md)

The options that are required to initialize the GooglePay payment method.
They can be omitted unless you need to support GooglePay.

___

### googlepayadyenv3

• `Optional` **googlepayadyenv3**: [`GooglePayCustomerInitializeOptions`](internal_.GooglePayCustomerInitializeOptions.md)

The options that are required to initialize the GooglePay payment method.
They can be omitted unless you need to support GooglePay.

___

### googlepayauthorizenet

• `Optional` **googlepayauthorizenet**: [`GooglePayCustomerInitializeOptions`](internal_.GooglePayCustomerInitializeOptions.md)

The options that are required to initialize the GooglePay payment method.
They can be omitted unless you need to support GooglePay.

___

### googlepaybnz

• `Optional` **googlepaybnz**: [`GooglePayCustomerInitializeOptions`](internal_.GooglePayCustomerInitializeOptions.md)

The options that are required to initialize the GooglePay payment method.
They can be omitted unless you need to support GooglePay.

___

### googlepaybraintree

• `Optional` **googlepaybraintree**: [`GooglePayCustomerInitializeOptions`](internal_.GooglePayCustomerInitializeOptions.md)

The options that are required to initialize the GooglePay payment method.
They can be omitted unless you need to support GooglePay.

___

### googlepaycheckoutcom

• `Optional` **googlepaycheckoutcom**: [`GooglePayCustomerInitializeOptions`](internal_.GooglePayCustomerInitializeOptions.md)

The options that are required to initialize the GooglePay payment method.
They can be omitted unless you need to support GooglePay.

___

### googlepaycybersourcev2

• `Optional` **googlepaycybersourcev2**: [`GooglePayCustomerInitializeOptions`](internal_.GooglePayCustomerInitializeOptions.md)

The options that are required to initialize the GooglePay payment method.
They can be omitted unless you need to support GooglePay.

___

### googlepayorbital

• `Optional` **googlepayorbital**: [`GooglePayCustomerInitializeOptions`](internal_.GooglePayCustomerInitializeOptions.md)

The options that are required to initialize the GooglePay payment method.
They can be omitted unless you need to support GooglePay.

___

### googlepaystripe

• `Optional` **googlepaystripe**: [`GooglePayCustomerInitializeOptions`](internal_.GooglePayCustomerInitializeOptions.md)

The options that are required to initialize the GooglePay payment method.
They can be omitted unless you need to support GooglePay.

___

### googlepaystripeupe

• `Optional` **googlepaystripeupe**: [`GooglePayCustomerInitializeOptions`](internal_.GooglePayCustomerInitializeOptions.md)

The options that are required to initialize the GooglePay payment method.
They can be omitted unless you need to support GooglePay.

___

### masterpass

• `Optional` **masterpass**: [`MasterpassCustomerInitializeOptions`](internal_.MasterpassCustomerInitializeOptions.md)

The options that are required to initialize the Masterpass payment method.
They can be omitted unless you need to support Masterpass.

___

### methodId

• `Optional` **methodId**: `string`

#### Inherited from

[CustomerRequestOptions](internal_.CustomerRequestOptions.md).[methodId](internal_.CustomerRequestOptions.md#methodid)

___

### params

• `Optional` **params**: `Object`

The parameters of the request, if required.

#### Inherited from

[CustomerRequestOptions](internal_.CustomerRequestOptions.md).[params](internal_.CustomerRequestOptions.md#params)

___

### stripeupe

• `Optional` **stripeupe**: [`StripeUPECustomerInitializeOptions`](internal_.StripeUPECustomerInitializeOptions.md)

The options that are required to initialize the Customer Stripe Upe payment method.
They can be omitted unless you need to support Customer Stripe Upe.

___

### timeout

• `Optional` **timeout**: `default`

Provide this option if you want to cancel or time out the request. If the
timeout object completes before the request, the request will be
cancelled.

#### Inherited from

[CustomerRequestOptions](internal_.CustomerRequestOptions.md).[timeout](internal_.CustomerRequestOptions.md#timeout)
