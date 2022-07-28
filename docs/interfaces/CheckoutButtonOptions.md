[@bigcommerce/checkout-sdk](../README.md) / CheckoutButtonOptions

# Interface: CheckoutButtonOptions

The set of options for configuring the checkout button.

## Hierarchy

- [`RequestOptions_2`](RequestOptions_2.md)

  ↳ **`CheckoutButtonOptions`**

  ↳↳ [`CheckoutButtonInitializeOptions_3`](CheckoutButtonInitializeOptions_3.md)

## Table of contents

### Properties

- [methodId](CheckoutButtonOptions.md#methodid)
- [params](CheckoutButtonOptions.md#params)
- [timeout](CheckoutButtonOptions.md#timeout)

## Properties

### methodId

• **methodId**: `string`

The identifier of the payment method.

___

### params

• `Optional` **params**: `Object`

The parameters of the request, if required.

#### Inherited from

[RequestOptions_2](RequestOptions_2.md).[params](RequestOptions_2.md#params)

___

### timeout

• `Optional` **timeout**: `default`

Provide this option if you want to cancel or time out the request. If the
timeout object completes before the request, the request will be
cancelled.

#### Inherited from

[RequestOptions_2](RequestOptions_2.md).[timeout](RequestOptions_2.md#timeout)
