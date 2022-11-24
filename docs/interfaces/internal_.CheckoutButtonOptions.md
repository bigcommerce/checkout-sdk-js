[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / CheckoutButtonOptions

# Interface: CheckoutButtonOptions

[<internal>](../modules/internal_.md).CheckoutButtonOptions

The set of options for configuring the checkout button.

## Hierarchy

- [`RequestOptions`](internal_.RequestOptions.md)

  ↳ **`CheckoutButtonOptions`**

  ↳↳ [`BaseCheckoutButtonInitializeOptions`](internal_.BaseCheckoutButtonInitializeOptions.md)

## Table of contents

### Properties

- [methodId](internal_.CheckoutButtonOptions.md#methodid)
- [params](internal_.CheckoutButtonOptions.md#params)
- [timeout](internal_.CheckoutButtonOptions.md#timeout)

## Properties

### methodId

• **methodId**: [`CheckoutButtonMethodType`](../enums/internal_.CheckoutButtonMethodType.md)

The identifier of the payment method.

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
