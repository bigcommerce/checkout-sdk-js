[@bigcommerce/checkout-sdk](../README.md) / CheckoutButtonInitializeOptions_3

# Interface: CheckoutButtonInitializeOptions\_3

## Hierarchy

- [`CheckoutButtonOptions`](CheckoutButtonOptions.md)

  ↳ **`CheckoutButtonInitializeOptions_3`**

## Indexable

▪ [key: `string`]: `unknown`

## Table of contents

### Properties

- [containerId](CheckoutButtonInitializeOptions_3.md#containerid)
- [methodId](CheckoutButtonInitializeOptions_3.md#methodid)
- [params](CheckoutButtonInitializeOptions_3.md#params)
- [timeout](CheckoutButtonInitializeOptions_3.md#timeout)

## Properties

### containerId

• **containerId**: `string`

The ID of a container which the checkout button should be inserted.

___

### methodId

• **methodId**: `string`

The identifier of the payment method.

#### Inherited from

[CheckoutButtonOptions](CheckoutButtonOptions.md).[methodId](CheckoutButtonOptions.md#methodid)

___

### params

• `Optional` **params**: `Object`

The parameters of the request, if required.

#### Inherited from

[CheckoutButtonOptions](CheckoutButtonOptions.md).[params](CheckoutButtonOptions.md#params)

___

### timeout

• `Optional` **timeout**: `default`

Provide this option if you want to cancel or time out the request. If the
timeout object completes before the request, the request will be
cancelled.

#### Inherited from

[CheckoutButtonOptions](CheckoutButtonOptions.md).[timeout](CheckoutButtonOptions.md#timeout)
