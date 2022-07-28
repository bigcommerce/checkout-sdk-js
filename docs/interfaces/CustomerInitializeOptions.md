[@bigcommerce/checkout-sdk](../README.md) / CustomerInitializeOptions

# Interface: CustomerInitializeOptions

A set of options that are required to initialize the customer step of the
current checkout flow.

Some payment methods have specific requirements for setting the customer
details for checkout. For example, Amazon Pay requires the customer to sign in
using their sign-in button. As a result, you may need to provide additional
information in order to initialize the customer step of checkout.

## Hierarchy

- [`CustomerRequestOptions`](CustomerRequestOptions.md)

  ↳ **`CustomerInitializeOptions`**

## Table of contents

### Properties

- [amazon](CustomerInitializeOptions.md#amazon)
- [amazonpay](CustomerInitializeOptions.md#amazonpay)
- [applepay](CustomerInitializeOptions.md#applepay)
- [bolt](CustomerInitializeOptions.md#bolt)
- [braintreevisacheckout](CustomerInitializeOptions.md#braintreevisacheckout)
- [chasepay](CustomerInitializeOptions.md#chasepay)
- [googlepayadyenv2](CustomerInitializeOptions.md#googlepayadyenv2)
- [googlepayadyenv3](CustomerInitializeOptions.md#googlepayadyenv3)
- [googlepayauthorizenet](CustomerInitializeOptions.md#googlepayauthorizenet)
- [googlepaybraintree](CustomerInitializeOptions.md#googlepaybraintree)
- [googlepaycheckoutcom](CustomerInitializeOptions.md#googlepaycheckoutcom)
- [googlepaycybersourcev2](CustomerInitializeOptions.md#googlepaycybersourcev2)
- [googlepayorbital](CustomerInitializeOptions.md#googlepayorbital)
- [googlepaystripe](CustomerInitializeOptions.md#googlepaystripe)
- [googlepaystripeupe](CustomerInitializeOptions.md#googlepaystripeupe)
- [masterpass](CustomerInitializeOptions.md#masterpass)
- [methodId](CustomerInitializeOptions.md#methodid)
- [params](CustomerInitializeOptions.md#params)
- [timeout](CustomerInitializeOptions.md#timeout)

## Properties

### amazon

• `Optional` **amazon**: [`AmazonPayCustomerInitializeOptions`](AmazonPayCustomerInitializeOptions.md)

The options that are required to initialize the customer step of checkout
when using Amazon Pay.

___

### amazonpay

• `Optional` **amazonpay**: [`AmazonPayV2CustomerInitializeOptions`](AmazonPayV2CustomerInitializeOptions.md)

The options that are required to initialize the customer step of checkout
when using AmazonPayV2.

___

### applepay

• `Optional` **applepay**: [`ApplePayCustomerInitializeOptions`](ApplePayCustomerInitializeOptions.md)

The options that are required to initialize the customer step of checkout
when using ApplePay.

___

### bolt

• `Optional` **bolt**: [`BoltCustomerInitializeOptions`](BoltCustomerInitializeOptions.md)

The options that are required to initialize the customer step of checkout
when using Bolt.

___

### braintreevisacheckout

• `Optional` **braintreevisacheckout**: [`BraintreeVisaCheckoutCustomerInitializeOptions`](BraintreeVisaCheckoutCustomerInitializeOptions.md)

The options that are required to initialize the customer step of checkout
when using Visa Checkout provided by Braintree.

___

### chasepay

• `Optional` **chasepay**: [`ChasePayCustomerInitializeOptions`](ChasePayCustomerInitializeOptions.md)

The options that are required to initialize the Chasepay payment method.
They can be omitted unless you need to support Chasepay.

___

### googlepayadyenv2

• `Optional` **googlepayadyenv2**: [`GooglePayCustomerInitializeOptions`](GooglePayCustomerInitializeOptions.md)

The options that are required to initialize the GooglePay payment method.
They can be omitted unless you need to support GooglePay.

___

### googlepayadyenv3

• `Optional` **googlepayadyenv3**: [`GooglePayCustomerInitializeOptions`](GooglePayCustomerInitializeOptions.md)

The options that are required to initialize the GooglePay payment method.
They can be omitted unless you need to support GooglePay.

___

### googlepayauthorizenet

• `Optional` **googlepayauthorizenet**: [`GooglePayCustomerInitializeOptions`](GooglePayCustomerInitializeOptions.md)

The options that are required to initialize the GooglePay payment method.
They can be omitted unless you need to support GooglePay.

___

### googlepaybraintree

• `Optional` **googlepaybraintree**: [`GooglePayCustomerInitializeOptions`](GooglePayCustomerInitializeOptions.md)

The options that are required to initialize the GooglePay payment method.
They can be omitted unless you need to support GooglePay.

___

### googlepaycheckoutcom

• `Optional` **googlepaycheckoutcom**: [`GooglePayCustomerInitializeOptions`](GooglePayCustomerInitializeOptions.md)

The options that are required to initialize the GooglePay payment method.
They can be omitted unless you need to support GooglePay.

___

### googlepaycybersourcev2

• `Optional` **googlepaycybersourcev2**: [`GooglePayCustomerInitializeOptions`](GooglePayCustomerInitializeOptions.md)

The options that are required to initialize the GooglePay payment method.
They can be omitted unless you need to support GooglePay.

___

### googlepayorbital

• `Optional` **googlepayorbital**: [`GooglePayCustomerInitializeOptions`](GooglePayCustomerInitializeOptions.md)

The options that are required to initialize the GooglePay payment method.
They can be omitted unless you need to support GooglePay.

___

### googlepaystripe

• `Optional` **googlepaystripe**: [`GooglePayCustomerInitializeOptions`](GooglePayCustomerInitializeOptions.md)

The options that are required to initialize the GooglePay payment method.
They can be omitted unless you need to support GooglePay.

___

### googlepaystripeupe

• `Optional` **googlepaystripeupe**: [`GooglePayCustomerInitializeOptions`](GooglePayCustomerInitializeOptions.md)

The options that are required to initialize the GooglePay payment method.
They can be omitted unless you need to support GooglePay.

___

### masterpass

• `Optional` **masterpass**: [`MasterpassCustomerInitializeOptions`](MasterpassCustomerInitializeOptions.md)

The options that are required to initialize the Masterpass payment method.
They can be omitted unless you need to support Masterpass.

___

### methodId

• `Optional` **methodId**: `string`

#### Inherited from

[CustomerRequestOptions](CustomerRequestOptions.md).[methodId](CustomerRequestOptions.md#methodid)

___

### params

• `Optional` **params**: `Object`

The parameters of the request, if required.

#### Inherited from

[CustomerRequestOptions](CustomerRequestOptions.md).[params](CustomerRequestOptions.md#params)

___

### timeout

• `Optional` **timeout**: `default`

Provide this option if you want to cancel or time out the request. If the
timeout object completes before the request, the request will be
cancelled.

#### Inherited from

[CustomerRequestOptions](CustomerRequestOptions.md).[timeout](CustomerRequestOptions.md#timeout)
