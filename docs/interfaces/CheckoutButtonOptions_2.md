[@bigcommerce/checkout-sdk](../README.md) / CheckoutButtonOptions_2

# Interface: CheckoutButtonOptions\_2

The set of options for configuring the checkout button.

## Hierarchy

- [`RequestOptions`](RequestOptions.md)

  ↳ **`CheckoutButtonOptions_2`**

  ↳↳ [`CheckoutButtonInitializeOptions_4`](CheckoutButtonInitializeOptions_4.md)

## Table of contents

### Properties

- [methodId](CheckoutButtonOptions_2.md#methodid)
- [params](CheckoutButtonOptions_2.md#params)
- [timeout](CheckoutButtonOptions_2.md#timeout)

## Properties

### methodId

• **methodId**: [`CheckoutButtonMethodType`](../enums/CheckoutButtonMethodType.md)

The identifier of the payment method.

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
