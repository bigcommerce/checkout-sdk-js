[@bigcommerce/checkout-sdk](../README.md) / CustomerRequestOptions

# Interface: CustomerRequestOptions

A set of options for configuring any requests related to the customer step of
the current checkout flow.

Some payment methods have their own sign-in or sign-out flow. Therefore, you
need to indicate the method you want to use if you need to trigger a specific
flow for signing in or out a customer. Otherwise, these options are not required.

## Hierarchy

- [`RequestOptions`](RequestOptions.md)

  ↳ **`CustomerRequestOptions`**

  ↳↳ [`BaseCustomerInitializeOptions`](BaseCustomerInitializeOptions.md)

  ↳↳ [`ExecutePaymentMethodCheckoutOptions`](ExecutePaymentMethodCheckoutOptions.md)

## Table of contents

### Properties

- [methodId](CustomerRequestOptions.md#methodid)
- [params](CustomerRequestOptions.md#params)
- [timeout](CustomerRequestOptions.md#timeout)

## Properties

### methodId

• `Optional` **methodId**: `string`

___

### params

• `Optional` **params**: `Object`

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
