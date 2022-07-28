[@bigcommerce/checkout-sdk](../README.md) / CustomerInitializeOptions_4

# Interface: CustomerInitializeOptions\_4

A set of options that are required to initialize the customer step of the
current checkout flow.

Some payment methods have specific requirements for setting the customer
details for checkout. For example, Amazon Pay requires the customer to sign in
using their sign-in button. As a result, you may need to provide additional
information in order to initialize the customer step of checkout.

## Hierarchy

- [`CustomerRequestOptions_2`](CustomerRequestOptions_2.md)

  ↳ **`CustomerInitializeOptions_4`**

## Table of contents

### Properties

- [amazon](CustomerInitializeOptions_4.md#amazon)
- [amazonpay](CustomerInitializeOptions_4.md#amazonpay)
- [applepay](CustomerInitializeOptions_4.md#applepay)
- [bolt](CustomerInitializeOptions_4.md#bolt)
- [braintreevisacheckout](CustomerInitializeOptions_4.md#braintreevisacheckout)
- [chasepay](CustomerInitializeOptions_4.md#chasepay)
- [googlepayadyenv2](CustomerInitializeOptions_4.md#googlepayadyenv2)
- [googlepayadyenv3](CustomerInitializeOptions_4.md#googlepayadyenv3)
- [googlepayauthorizenet](CustomerInitializeOptions_4.md#googlepayauthorizenet)
- [googlepaybraintree](CustomerInitializeOptions_4.md#googlepaybraintree)
- [googlepaycheckoutcom](CustomerInitializeOptions_4.md#googlepaycheckoutcom)
- [googlepaycybersourcev2](CustomerInitializeOptions_4.md#googlepaycybersourcev2)
- [googlepayorbital](CustomerInitializeOptions_4.md#googlepayorbital)
- [googlepaystripe](CustomerInitializeOptions_4.md#googlepaystripe)
- [googlepaystripeupe](CustomerInitializeOptions_4.md#googlepaystripeupe)
- [masterpass](CustomerInitializeOptions_4.md#masterpass)
- [methodId](CustomerInitializeOptions_4.md#methodid)
- [params](CustomerInitializeOptions_4.md#params)
- [timeout](CustomerInitializeOptions_4.md#timeout)

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

• `Optional` **applepay**: [`ApplePayCustomerInitializeOptions_2`](ApplePayCustomerInitializeOptions_2.md)

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

[CustomerRequestOptions_2](CustomerRequestOptions_2.md).[methodId](CustomerRequestOptions_2.md#methodid)

___

### params

• `Optional` **params**: `Object`

The parameters of the request, if required.

#### Inherited from

[CustomerRequestOptions_2](CustomerRequestOptions_2.md).[params](CustomerRequestOptions_2.md#params)

___

### timeout

• `Optional` **timeout**: `default`

Provide this option if you want to cancel or time out the request. If the
timeout object completes before the request, the request will be
cancelled.

#### Inherited from

[CustomerRequestOptions_2](CustomerRequestOptions_2.md).[timeout](CustomerRequestOptions_2.md#timeout)
