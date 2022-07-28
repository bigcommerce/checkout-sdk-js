[@bigcommerce/checkout-sdk](../README.md) / PaymentRequestOptions

# Interface: PaymentRequestOptions

The set of options for configuring any requests related to the payment step of
the current checkout flow.

## Hierarchy

- [`RequestOptions_2`](RequestOptions_2.md)

  ↳ **`PaymentRequestOptions`**

  ↳↳ [`PaymentInitializeOptions_3`](PaymentInitializeOptions_3.md)

## Table of contents

### Properties

- [gatewayId](PaymentRequestOptions.md#gatewayid)
- [methodId](PaymentRequestOptions.md#methodid)
- [params](PaymentRequestOptions.md#params)
- [timeout](PaymentRequestOptions.md#timeout)

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

[RequestOptions_2](RequestOptions_2.md).[params](RequestOptions_2.md#params)

___

### timeout

• `Optional` **timeout**: `default`

Provide this option if you want to cancel or time out the request. If the
timeout object completes before the request, the request will be
cancelled.

#### Inherited from

[RequestOptions_2](RequestOptions_2.md).[timeout](RequestOptions_2.md#timeout)
