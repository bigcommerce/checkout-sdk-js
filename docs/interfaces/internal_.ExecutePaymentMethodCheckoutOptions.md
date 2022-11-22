[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / ExecutePaymentMethodCheckoutOptions

# Interface: ExecutePaymentMethodCheckoutOptions

[<internal>](../modules/internal_.md).ExecutePaymentMethodCheckoutOptions

A set of options that are required to pass the customer step of the
current checkout flow.

Some payment methods have specific suggestion for customer to pass
the customer step. For example, Bolt suggests the customer to use
their custom checkout with prefilled form values. As a result, you
may need to provide additional information, error handler or callback
to execution method.

## Hierarchy

- [`CustomerRequestOptions`](internal_.CustomerRequestOptions.md)

  ↳ **`ExecutePaymentMethodCheckoutOptions`**

## Table of contents

### Properties

- [methodId](internal_.ExecutePaymentMethodCheckoutOptions.md#methodid)
- [params](internal_.ExecutePaymentMethodCheckoutOptions.md#params)
- [timeout](internal_.ExecutePaymentMethodCheckoutOptions.md#timeout)

### Methods

- [checkoutPaymentMethodExecuted](internal_.ExecutePaymentMethodCheckoutOptions.md#checkoutpaymentmethodexecuted)
- [continueWithCheckoutCallback](internal_.ExecutePaymentMethodCheckoutOptions.md#continuewithcheckoutcallback)

## Properties

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

### timeout

• `Optional` **timeout**: `default`

Provide this option if you want to cancel or time out the request. If the
timeout object completes before the request, the request will be
cancelled.

#### Inherited from

[CustomerRequestOptions](internal_.CustomerRequestOptions.md).[timeout](internal_.CustomerRequestOptions.md#timeout)

## Methods

### checkoutPaymentMethodExecuted

▸ `Optional` **checkoutPaymentMethodExecuted**(`data?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data?` | [`CheckoutPaymentMethodExecutedOptions`](internal_.CheckoutPaymentMethodExecutedOptions.md) |

#### Returns

`void`

___

### continueWithCheckoutCallback

▸ `Optional` **continueWithCheckoutCallback**(): `void`

#### Returns

`void`
