[@bigcommerce/checkout-sdk](../README.md) / PaymentRequestOptions_2

# Interface: PaymentRequestOptions\_2

The set of options for configuring any requests related to the payment step of
the current checkout flow.

## Hierarchy

- [`RequestOptions`](RequestOptions.md)

  ↳ **`PaymentRequestOptions_2`**

  ↳↳ [`PaymentInitializeOptions_4`](PaymentInitializeOptions_4.md)

## Table of contents

### Properties

- [gatewayId](PaymentRequestOptions_2.md#gatewayid)
- [methodId](PaymentRequestOptions_2.md#methodid)
- [params](PaymentRequestOptions_2.md#params)
- [timeout](PaymentRequestOptions_2.md#timeout)

## Properties

### gatewayId

• `Optional` **gatewayId**: `string`

The identifier of the payment provider providing the payment method. This
option is only required if the provider offers multiple payment options.
i.e.: Adyen and Klarna.

___

### methodId

• **methodId**: `string`

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
