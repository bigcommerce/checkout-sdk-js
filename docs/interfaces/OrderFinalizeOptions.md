[@bigcommerce/checkout-sdk](../README.md) / OrderFinalizeOptions

# Interface: OrderFinalizeOptions

## Hierarchy

- [`RequestOptions`](RequestOptions.md)

  ↳ **`OrderFinalizeOptions`**

## Table of contents

### Properties

- [integrations](OrderFinalizeOptions.md#integrations)
- [params](OrderFinalizeOptions.md#params)
- [timeout](OrderFinalizeOptions.md#timeout)

## Properties

### integrations

• `Optional` **integrations**: `PaymentStrategyFactory`<`default`\>[]

**`alpha`**

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
