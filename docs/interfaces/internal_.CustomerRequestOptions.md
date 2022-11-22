[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / CustomerRequestOptions

# Interface: CustomerRequestOptions

[<internal>](../modules/internal_.md).CustomerRequestOptions

A set of options for configuring any requests related to the customer step of
the current checkout flow.

Some payment methods have their own sign-in or sign-out flow. Therefore, you
need to indicate the method you want to use if you need to trigger a specific
flow for signing in or out a customer. Otherwise, these options are not required.

## Hierarchy

- [`RequestOptions`](internal_.RequestOptions.md)

  ↳ **`CustomerRequestOptions`**

  ↳↳ [`ExecutePaymentMethodCheckoutOptions`](internal_.ExecutePaymentMethodCheckoutOptions.md)

  ↳↳ [`BaseCustomerInitializeOptions`](internal_.BaseCustomerInitializeOptions.md)

## Table of contents

### Properties

- [methodId](internal_.CustomerRequestOptions.md#methodid)
- [params](internal_.CustomerRequestOptions.md#params)
- [timeout](internal_.CustomerRequestOptions.md#timeout)

## Properties

### methodId

• `Optional` **methodId**: `string`

___

### params

• `Optional` **params**: `Object`

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
