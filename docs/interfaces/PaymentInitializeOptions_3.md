[@bigcommerce/checkout-sdk](../README.md) / PaymentInitializeOptions_3

# Interface: PaymentInitializeOptions\_3

## Hierarchy

- [`PaymentRequestOptions`](PaymentRequestOptions.md)

  ↳ **`PaymentInitializeOptions_3`**

## Indexable

▪ [key: `string`]: `unknown`

## Table of contents

### Properties

- [gatewayId](PaymentInitializeOptions_3.md#gatewayid)
- [methodId](PaymentInitializeOptions_3.md#methodid)
- [params](PaymentInitializeOptions_3.md#params)
- [timeout](PaymentInitializeOptions_3.md#timeout)

## Properties

### gatewayId

• `Optional` **gatewayId**: `string`

The identifier of the payment provider providing the payment method. This
option is only required if the provider offers multiple payment options.
i.e.: Adyen and Klarna.

#### Inherited from

[PaymentRequestOptions](PaymentRequestOptions.md).[gatewayId](PaymentRequestOptions.md#gatewayid)

___

### methodId

• **methodId**: `string`

The identifier of the payment method.

#### Inherited from

[PaymentRequestOptions](PaymentRequestOptions.md).[methodId](PaymentRequestOptions.md#methodid)

___

### params

• `Optional` **params**: `Object`

The parameters of the request, if required.

#### Inherited from

[PaymentRequestOptions](PaymentRequestOptions.md).[params](PaymentRequestOptions.md#params)

___

### timeout

• `Optional` **timeout**: `default`

Provide this option if you want to cancel or time out the request. If the
timeout object completes before the request, the request will be
cancelled.

#### Inherited from

[PaymentRequestOptions](PaymentRequestOptions.md).[timeout](PaymentRequestOptions.md#timeout)
