[@bigcommerce/checkout-sdk](../README.md) / BasePaymentInitializeOptions

# Interface: BasePaymentInitializeOptions

A set of options that are required to initialize the payment step of the
current checkout flow.

## Hierarchy

- [`PaymentRequestOptions`](PaymentRequestOptions.md)

  ↳ **`BasePaymentInitializeOptions`**

## Table of contents

### Properties

- [creditCard](BasePaymentInitializeOptions.md#creditcard)
- [gatewayId](BasePaymentInitializeOptions.md#gatewayid)
- [integrations](BasePaymentInitializeOptions.md#integrations)
- [methodId](BasePaymentInitializeOptions.md#methodid)
- [params](BasePaymentInitializeOptions.md#params)
- [timeout](BasePaymentInitializeOptions.md#timeout)

## Properties

### creditCard

• `Optional` **creditCard**: `CreditCardPaymentInitializeOptions`

**`alpha`**
Please note that this option is currently in an early stage of
development. Therefore the API is unstable and not ready for public
consumption.

___

### gatewayId

• `Optional` **gatewayId**: `string`

The identifier of the payment provider providing the payment method. This
option is only required if the provider offers multiple payment options.
i.e.: Adyen and Klarna.

#### Inherited from

[PaymentRequestOptions](PaymentRequestOptions.md).[gatewayId](PaymentRequestOptions.md#gatewayid)

___

### integrations

• `Optional` **integrations**: `PaymentStrategyFactory`<`default`\>[]

**`alpha`**

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
