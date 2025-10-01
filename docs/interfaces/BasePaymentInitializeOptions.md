[@bigcommerce/checkout-sdk](../README.md) / BasePaymentInitializeOptions

# Interface: BasePaymentInitializeOptions

A set of options that are required to initialize the payment step of the
current checkout flow.

## Hierarchy

- [`PaymentRequestOptions`](PaymentRequestOptions.md)

  ↳ **`BasePaymentInitializeOptions`**

## Table of contents

### Properties

- [braintree](BasePaymentInitializeOptions.md#braintree)
- [braintreevisacheckout](BasePaymentInitializeOptions.md#braintreevisacheckout)
- [creditCard](BasePaymentInitializeOptions.md#creditcard)
- [gatewayId](BasePaymentInitializeOptions.md#gatewayid)
- [integrations](BasePaymentInitializeOptions.md#integrations)
- [masterpass](BasePaymentInitializeOptions.md#masterpass)
- [methodId](BasePaymentInitializeOptions.md#methodid)
- [params](BasePaymentInitializeOptions.md#params)
- [paypalexpress](BasePaymentInitializeOptions.md#paypalexpress)
- [timeout](BasePaymentInitializeOptions.md#timeout)

## Properties

### braintree

• `Optional` **braintree**: [`BraintreePaymentInitializeOptions`](BraintreePaymentInitializeOptions.md)

The options that are required to initialize the Braintree payment method.
They can be omitted unless you need to support Braintree.

___

### braintreevisacheckout

• `Optional` **braintreevisacheckout**: [`BraintreeVisaCheckoutPaymentInitializeOptions`](BraintreeVisaCheckoutPaymentInitializeOptions.md)

The options that are required to initialize the Visa Checkout payment
method provided by Braintree. They can be omitted unless you need to
support Visa Checkout.

___

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

### masterpass

• `Optional` **masterpass**: [`MasterpassPaymentInitializeOptions`](MasterpassPaymentInitializeOptions.md)

The options that are required to initialize the Masterpass payment method.
They can be omitted unless you need to support Masterpass.

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

### paypalexpress

• `Optional` **paypalexpress**: [`PaypalExpressPaymentInitializeOptions`](PaypalExpressPaymentInitializeOptions.md)

The options that are required to initialize the PayPal Express payment method.
They can be omitted unless you need to support PayPal Express.

___

### timeout

• `Optional` **timeout**: `default`

Provide this option if you want to cancel or time out the request. If the
timeout object completes before the request, the request will be
cancelled.

#### Inherited from

[PaymentRequestOptions](PaymentRequestOptions.md).[timeout](PaymentRequestOptions.md#timeout)
