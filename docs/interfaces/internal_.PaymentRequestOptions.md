[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / PaymentRequestOptions

# Interface: PaymentRequestOptions

[<internal>](../modules/internal_.md).PaymentRequestOptions

The set of options for configuring any requests related to the payment step of
the current checkout flow.

## Hierarchy

- [`RequestOptions`](internal_.RequestOptions.md)

  ↳ **`PaymentRequestOptions`**

  ↳↳ [`BasePaymentInitializeOptions`](internal_.BasePaymentInitializeOptions.md)

## Table of contents

### Properties

- [gatewayId](internal_.PaymentRequestOptions.md#gatewayid)
- [methodId](internal_.PaymentRequestOptions.md#methodid)
- [params](internal_.PaymentRequestOptions.md#params)
- [timeout](internal_.PaymentRequestOptions.md#timeout)

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

[RequestOptions](internal_.RequestOptions.md).[params](internal_.RequestOptions.md#params)

___

### timeout

• `Optional` **timeout**: `default`

Provide this option if you want to cancel or time out the request. If the
timeout object completes before the request, the request will be
cancelled.

#### Inherited from

[RequestOptions](internal_.RequestOptions.md).[timeout](internal_.RequestOptions.md#timeout)
