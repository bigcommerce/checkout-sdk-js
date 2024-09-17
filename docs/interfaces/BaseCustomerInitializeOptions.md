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

- [braintreepaypalcredit](BaseCustomerInitializeOptions.md#braintreepaypalcredit)
- [braintreevisacheckout](BaseCustomerInitializeOptions.md#braintreevisacheckout)
- [masterpass](BaseCustomerInitializeOptions.md#masterpass)
- [methodId](BaseCustomerInitializeOptions.md#methodid)
- [params](BaseCustomerInitializeOptions.md#params)
- [timeout](BaseCustomerInitializeOptions.md#timeout)

## Properties

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
