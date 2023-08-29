[@bigcommerce/checkout-sdk](../README.md) / BaseCustomerInitializeOptions

# Interface: BaseCustomerInitializeOptions

A set of options that are required to initialize the customer step of the
current checkout flow.

Some payment methods have specific requirements for setting the customer
details for checkout. For example, Amazon Pay requires the customer to sign in
using their sign-in button. As a result, you may need to provide additional
information in order to initialize the customer step of checkout.

## Hierarchy

- [`CustomerRequestOptions`](CustomerRequestOptions.md)

  ↳ **`BaseCustomerInitializeOptions`**

## Indexable

▪ [key: `string`]: `unknown`

## Table of contents

### Properties

- [amazonpay](BaseCustomerInitializeOptions.md#amazonpay)
- [braintreepaypalcredit](BaseCustomerInitializeOptions.md#braintreepaypalcredit)
- [braintreevisacheckout](BaseCustomerInitializeOptions.md#braintreevisacheckout)
- [chasepay](BaseCustomerInitializeOptions.md#chasepay)
- [googlepayadyenv2](BaseCustomerInitializeOptions.md#googlepayadyenv2)
- [googlepayadyenv3](BaseCustomerInitializeOptions.md#googlepayadyenv3)
- [googlepayauthorizenet](BaseCustomerInitializeOptions.md#googlepayauthorizenet)
- [googlepaybnz](BaseCustomerInitializeOptions.md#googlepaybnz)
- [googlepaybraintree](BaseCustomerInitializeOptions.md#googlepaybraintree)
- [googlepaycheckoutcom](BaseCustomerInitializeOptions.md#googlepaycheckoutcom)
- [googlepaycybersourcev2](BaseCustomerInitializeOptions.md#googlepaycybersourcev2)
- [googlepayorbital](BaseCustomerInitializeOptions.md#googlepayorbital)
- [googlepaystripe](BaseCustomerInitializeOptions.md#googlepaystripe)
- [googlepaystripeupe](BaseCustomerInitializeOptions.md#googlepaystripeupe)
- [googlepayworldpayaccess](BaseCustomerInitializeOptions.md#googlepayworldpayaccess)
- [masterpass](BaseCustomerInitializeOptions.md#masterpass)
- [methodId](BaseCustomerInitializeOptions.md#methodid)
- [params](BaseCustomerInitializeOptions.md#params)
- [stripeupe](BaseCustomerInitializeOptions.md#stripeupe)
- [timeout](BaseCustomerInitializeOptions.md#timeout)

## Properties

### amazonpay

• `Optional` **amazonpay**: [`AmazonPayV2CustomerInitializeOptions`](AmazonPayV2CustomerInitializeOptions.md)

The options that are required to initialize the customer step of checkout
when using AmazonPayV2.

___

### braintreepaypalcredit

• `Optional` **braintreepaypalcredit**: [`BraintreePaypalCreditCustomerInitializeOptions`](BraintreePaypalCreditCustomerInitializeOptions.md)

The options that are required to facilitate Braintree Credit. They can be
omitted unless you need to support Braintree Credit.

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

### googlepaybnz

• `Optional` **googlepaybnz**: [`GooglePayCustomerInitializeOptions`](GooglePayCustomerInitializeOptions.md)

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

### googlepayworldpayaccess

• `Optional` **googlepayworldpayaccess**: [`GooglePayCustomerInitializeOptions`](GooglePayCustomerInitializeOptions.md)

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

### stripeupe

• `Optional` **stripeupe**: [`StripeUPECustomerInitializeOptions`](StripeUPECustomerInitializeOptions.md)

The options that are required to initialize the Customer Stripe Upe payment method.
They can be omitted unless you need to support Customer Stripe Upe.

___

### timeout

• `Optional` **timeout**: `default`

Provide this option if you want to cancel or time out the request. If the
timeout object completes before the request, the request will be
cancelled.

#### Inherited from

[CustomerRequestOptions](CustomerRequestOptions.md).[timeout](CustomerRequestOptions.md#timeout)
