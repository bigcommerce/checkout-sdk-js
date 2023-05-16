[@bigcommerce/checkout-sdk](../README.md) / BasePaymentInitializeOptions

# Interface: BasePaymentInitializeOptions

A set of options that are required to initialize the payment step of the
current checkout flow.

## Hierarchy

- [`PaymentRequestOptions`](PaymentRequestOptions.md)

  ↳ **`BasePaymentInitializeOptions`**

## Table of contents

### Properties

- [amazonpay](BasePaymentInitializeOptions.md#amazonpay)
- [bluesnapv2](BasePaymentInitializeOptions.md#bluesnapv2)
- [braintree](BasePaymentInitializeOptions.md#braintree)
- [braintreevisacheckout](BasePaymentInitializeOptions.md#braintreevisacheckout)
- [chasepay](BasePaymentInitializeOptions.md#chasepay)
- [creditCard](BasePaymentInitializeOptions.md#creditcard)
- [digitalriver](BasePaymentInitializeOptions.md#digitalriver)
- [gatewayId](BasePaymentInitializeOptions.md#gatewayid)
- [googlepayadyenv2](BasePaymentInitializeOptions.md#googlepayadyenv2)
- [googlepayadyenv3](BasePaymentInitializeOptions.md#googlepayadyenv3)
- [googlepayauthorizenet](BasePaymentInitializeOptions.md#googlepayauthorizenet)
- [googlepaybnz](BasePaymentInitializeOptions.md#googlepaybnz)
- [googlepaybraintree](BasePaymentInitializeOptions.md#googlepaybraintree)
- [googlepaycheckoutcom](BasePaymentInitializeOptions.md#googlepaycheckoutcom)
- [googlepaycybersourcev2](BasePaymentInitializeOptions.md#googlepaycybersourcev2)
- [googlepayorbital](BasePaymentInitializeOptions.md#googlepayorbital)
- [googlepaystripe](BasePaymentInitializeOptions.md#googlepaystripe)
- [googlepaystripeupe](BasePaymentInitializeOptions.md#googlepaystripeupe)
- [googlepayworldpayaccess](BasePaymentInitializeOptions.md#googlepayworldpayaccess)
- [klarna](BasePaymentInitializeOptions.md#klarna)
- [klarnav2](BasePaymentInitializeOptions.md#klarnav2)
- [masterpass](BasePaymentInitializeOptions.md#masterpass)
- [methodId](BasePaymentInitializeOptions.md#methodid)
- [mollie](BasePaymentInitializeOptions.md#mollie)
- [moneris](BasePaymentInitializeOptions.md#moneris)
- [opy](BasePaymentInitializeOptions.md#opy)
- [params](BasePaymentInitializeOptions.md#params)
- [paypalexpress](BasePaymentInitializeOptions.md#paypalexpress)
- [square](BasePaymentInitializeOptions.md#square)
- [stripeupe](BasePaymentInitializeOptions.md#stripeupe)
- [stripev3](BasePaymentInitializeOptions.md#stripev3)
- [timeout](BasePaymentInitializeOptions.md#timeout)
- [worldpay](BasePaymentInitializeOptions.md#worldpay)

## Properties

### amazonpay

• `Optional` **amazonpay**: [`AmazonPayV2PaymentInitializeOptions`](AmazonPayV2PaymentInitializeOptions.md)

The options that are required to initialize the AmazonPayV2 payment
method. They can be omitted unless you need to support AmazonPayV2.

___

### bluesnapv2

• `Optional` **bluesnapv2**: [`BlueSnapV2PaymentInitializeOptions`](BlueSnapV2PaymentInitializeOptions.md)

The options that are required to initialize the BlueSnapV2 payment method.
They can be omitted unless you need to support BlueSnapV2.

___

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

### chasepay

• `Optional` **chasepay**: [`ChasePayInitializeOptions`](ChasePayInitializeOptions.md)

The options that are required to initialize the Chasepay payment method.
They can be omitted unless you need to support Chasepay.

___

### creditCard

• `Optional` **creditCard**: `CreditCardPaymentInitializeOptions`

**`alpha`**
Please note that this option is currently in an early stage of
development. Therefore the API is unstable and not ready for public
consumption.

___

### digitalriver

• `Optional` **digitalriver**: [`DigitalRiverPaymentInitializeOptions`](DigitalRiverPaymentInitializeOptions.md)

The options that are required to initialize the Digital River payment method.
They can be omitted unless you need to support Digital River.

___

### gatewayId

• `Optional` **gatewayId**: `string`

The identifier of the payment provider providing the payment method. This
option is only required if the provider offers multiple payment options.
i.e.: Adyen and Klarna.

#### Inherited from

[PaymentRequestOptions](PaymentRequestOptions.md).[gatewayId](PaymentRequestOptions.md#gatewayid)

___

### googlepayadyenv2

• `Optional` **googlepayadyenv2**: [`GooglePayPaymentInitializeOptions`](GooglePayPaymentInitializeOptions.md)

The options that are required to initialize the GooglePay Authorize.Net
payment method. They can be omitted unless you need to support GooglePay.

___

### googlepayadyenv3

• `Optional` **googlepayadyenv3**: [`GooglePayPaymentInitializeOptions`](GooglePayPaymentInitializeOptions.md)

The options that are required to initialize the GooglePay Authorize.Net
payment method. They can be omitted unless you need to support GooglePay.

___

### googlepayauthorizenet

• `Optional` **googlepayauthorizenet**: [`GooglePayPaymentInitializeOptions`](GooglePayPaymentInitializeOptions.md)

The options that are required to initialize the GooglePay Authorize.Net
payment method. They can be omitted unless you need to support GooglePay.

___

### googlepaybnz

• `Optional` **googlepaybnz**: [`GooglePayPaymentInitializeOptions`](GooglePayPaymentInitializeOptions.md)

The options that are required to initialize the GooglePay Authorize.Net
payment method. They can be omitted unless you need to support GooglePay.

___

### googlepaybraintree

• `Optional` **googlepaybraintree**: [`GooglePayPaymentInitializeOptions`](GooglePayPaymentInitializeOptions.md)

The options that are required to initialize the GooglePay Braintree payment method.
They can be omitted unless you need to support GooglePay.

___

### googlepaycheckoutcom

• `Optional` **googlepaycheckoutcom**: [`GooglePayPaymentInitializeOptions`](GooglePayPaymentInitializeOptions.md)

The options that are required to initialize the GooglePay Checkout.com payment method.
They can be omitted unless you need to support GooglePay.

___

### googlepaycybersourcev2

• `Optional` **googlepaycybersourcev2**: [`GooglePayPaymentInitializeOptions`](GooglePayPaymentInitializeOptions.md)

The options that are required to initialize the GooglePay CybersourceV2 payment method.
They can be omitted unless you need to support GooglePay.

___

### googlepayorbital

• `Optional` **googlepayorbital**: [`GooglePayPaymentInitializeOptions`](GooglePayPaymentInitializeOptions.md)

The options that are required to initialize the GooglePay payment method.
They can be omitted unless you need to support GooglePay.

___

### googlepaystripe

• `Optional` **googlepaystripe**: [`GooglePayPaymentInitializeOptions`](GooglePayPaymentInitializeOptions.md)

The options that are required to initialize the GooglePay Stripe payment method.
They can be omitted unless you need to support GooglePay.

___

### googlepaystripeupe

• `Optional` **googlepaystripeupe**: [`GooglePayPaymentInitializeOptions`](GooglePayPaymentInitializeOptions.md)

The options that are required to initialize the GooglePay Stripe payment method.
They can be omitted unless you need to support GooglePay.

___

### googlepayworldpayaccess

• `Optional` **googlepayworldpayaccess**: [`GooglePayPaymentInitializeOptions`](GooglePayPaymentInitializeOptions.md)

The options that are required to initialize the GooglePay Worldpay Access payment method.
They can be omitted unless you need to support GooglePay.

___

### klarna

• `Optional` **klarna**: [`KlarnaPaymentInitializeOptions`](KlarnaPaymentInitializeOptions.md)

The options that are required to initialize the Klarna payment method.
They can be omitted unless you need to support Klarna.

___

### klarnav2

• `Optional` **klarnav2**: [`KlarnaV2PaymentInitializeOptions`](KlarnaV2PaymentInitializeOptions.md)

The options that are required to initialize the KlarnaV2 payment method.
They can be omitted unless you need to support KlarnaV2.

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

### mollie

• `Optional` **mollie**: [`MolliePaymentInitializeOptions`](MolliePaymentInitializeOptions.md)

The options that are required to initialize the Mollie payment method.
They can be omitted unless you need to support Mollie.

___

### moneris

• `Optional` **moneris**: [`MonerisPaymentInitializeOptions`](MonerisPaymentInitializeOptions.md)

The options that are required to initialize the Moneris payment method.
They can be omitted unless you need to support Moneris.

___

### opy

• `Optional` **opy**: [`OpyPaymentInitializeOptions`](OpyPaymentInitializeOptions.md)

The options that are required to initialize the Opy payment
method. They can be omitted unless you need to support Opy.

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

### square

• `Optional` **square**: [`SquarePaymentInitializeOptions`](SquarePaymentInitializeOptions.md)

The options that are required to initialize the Square payment method.
They can be omitted unless you need to support Square.

___

### stripeupe

• `Optional` **stripeupe**: [`StripeUPEPaymentInitializeOptions`](StripeUPEPaymentInitializeOptions.md)

The options that are required to initialize the StripeUPE payment method.
They can be omitted unless you need to support StripeUPE.

___

### stripev3

• `Optional` **stripev3**: [`StripeV3PaymentInitializeOptions`](StripeV3PaymentInitializeOptions.md)

The options that are required to initialize the Stripe payment method.
They can be omitted unless you need to support StripeV3.

___

### timeout

• `Optional` **timeout**: `default`

Provide this option if you want to cancel or time out the request. If the
timeout object completes before the request, the request will be
cancelled.

#### Inherited from

[PaymentRequestOptions](PaymentRequestOptions.md).[timeout](PaymentRequestOptions.md#timeout)

___

### worldpay

• `Optional` **worldpay**: [`WorldpayAccessPaymentInitializeOptions`](WorldpayAccessPaymentInitializeOptions.md)

The options that are required to initialize the Worldpay payment method.
They can be omitted unless you need to support Worldpay.
