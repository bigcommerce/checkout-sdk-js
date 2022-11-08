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

- [`CustomerRequestOptions`](CustomerRequestOptions.md)

  ↳ **`ExecutePaymentMethodCheckoutOptions`**

## Table of contents

### Properties

- [methodId](ExecutePaymentMethodCheckoutOptions.md#methodid)
- [params](ExecutePaymentMethodCheckoutOptions.md#params)
- [timeout](ExecutePaymentMethodCheckoutOptions.md#timeout)

### Methods

- [checkoutPaymentMethodExecuted](ExecutePaymentMethodCheckoutOptions.md#checkoutpaymentmethodexecuted)
- [continueWithCheckoutCallback](ExecutePaymentMethodCheckoutOptions.md#continuewithcheckoutcallback)

## Properties

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

## Methods

### checkoutPaymentMethodExecuted

▸ `Optional` **checkoutPaymentMethodExecuted**(`data?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data?` | [`CheckoutPaymentMethodExecutedOptions`](CheckoutPaymentMethodExecutedOptions.md) |

#### Returns

`void`

___

### continueWithCheckoutCallback

▸ `Optional` **continueWithCheckoutCallback**(): `void`

#### Returns

`void`
