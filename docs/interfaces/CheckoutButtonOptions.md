[@bigcommerce/checkout-sdk](../README.md) / CheckoutButtonOptions

# Interface: CheckoutButtonOptions

The set of options for configuring the checkout button.

## Hierarchy

- [`RequestOptions`](RequestOptions.md)

  ↳ **`CheckoutButtonOptions`**

  ↳↳ [`BaseCheckoutButtonInitializeOptions`](BaseCheckoutButtonInitializeOptions.md)

## Table of contents

### Properties

- [methodId](CheckoutButtonOptions.md#methodid)
- [params](CheckoutButtonOptions.md#params)
- [timeout](CheckoutButtonOptions.md#timeout)

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
