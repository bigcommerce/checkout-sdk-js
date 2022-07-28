[@bigcommerce/checkout-sdk](../README.md) / ExecutePaymentMethodCheckoutOptions

# Interface: ExecutePaymentMethodCheckoutOptions

A set of options that are required to pass the customer step of the
current checkout flow.

Some payment methods have specific suggestion for customer to pass
the customer step. For example, Bolt suggests the customer to use
their custom checkout with prefilled form values. As a result, you
may need to provide additional information, error handler or callback
to execution method.

## Hierarchy

- [`CustomerRequestOptions_2`](CustomerRequestOptions_2.md)

  ↳ **`ExecutePaymentMethodCheckoutOptions`**

## Table of contents

### Properties

- [methodId](ExecutePaymentMethodCheckoutOptions.md#methodid)
- [params](ExecutePaymentMethodCheckoutOptions.md#params)
- [timeout](ExecutePaymentMethodCheckoutOptions.md#timeout)

### Methods

- [continueWithCheckoutCallback](ExecutePaymentMethodCheckoutOptions.md#continuewithcheckoutcallback)

## Properties

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

## Methods

### continueWithCheckoutCallback

▸ `Optional` **continueWithCheckoutCallback**(): `void`

#### Returns

`void`
