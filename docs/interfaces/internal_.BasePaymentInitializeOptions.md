[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / BasePaymentInitializeOptions

# Interface: BasePaymentInitializeOptions

[<internal>](../modules/internal_.md).BasePaymentInitializeOptions

A set of options that are required to initialize the payment step of the
current checkout flow.

## Hierarchy

- [`PaymentRequestOptions`](internal_.PaymentRequestOptions.md)

  ↳ **`BasePaymentInitializeOptions`**

## Table of contents

### Properties

- [amazon](internal_.BasePaymentInitializeOptions.md#amazon)
- [amazonpay](internal_.BasePaymentInitializeOptions.md#amazonpay)
- [bluesnapv2](internal_.BasePaymentInitializeOptions.md#bluesnapv2)
- [bolt](internal_.BasePaymentInitializeOptions.md#bolt)
- [braintree](internal_.BasePaymentInitializeOptions.md#braintree)
- [braintreevisacheckout](internal_.BasePaymentInitializeOptions.md#braintreevisacheckout)
- [chasepay](internal_.BasePaymentInitializeOptions.md#chasepay)
- [digitalriver](internal_.BasePaymentInitializeOptions.md#digitalriver)
- [gatewayId](internal_.BasePaymentInitializeOptions.md#gatewayid)
- [googlepayadyenv2](internal_.BasePaymentInitializeOptions.md#googlepayadyenv2)
- [googlepayadyenv3](internal_.BasePaymentInitializeOptions.md#googlepayadyenv3)
- [googlepayauthorizenet](internal_.BasePaymentInitializeOptions.md#googlepayauthorizenet)
- [googlepaybnz](internal_.BasePaymentInitializeOptions.md#googlepaybnz)
- [googlepaybraintree](internal_.BasePaymentInitializeOptions.md#googlepaybraintree)
- [googlepaycheckoutcom](internal_.BasePaymentInitializeOptions.md#googlepaycheckoutcom)
- [googlepaycybersourcev2](internal_.BasePaymentInitializeOptions.md#googlepaycybersourcev2)
- [googlepayorbital](internal_.BasePaymentInitializeOptions.md#googlepayorbital)
- [googlepaystripe](internal_.BasePaymentInitializeOptions.md#googlepaystripe)
- [googlepaystripeupe](internal_.BasePaymentInitializeOptions.md#googlepaystripeupe)
- [klarna](internal_.BasePaymentInitializeOptions.md#klarna)
- [klarnav2](internal_.BasePaymentInitializeOptions.md#klarnav2)
- [masterpass](internal_.BasePaymentInitializeOptions.md#masterpass)
- [methodId](internal_.BasePaymentInitializeOptions.md#methodid)
- [mollie](internal_.BasePaymentInitializeOptions.md#mollie)
- [moneris](internal_.BasePaymentInitializeOptions.md#moneris)
- [opy](internal_.BasePaymentInitializeOptions.md#opy)
- [params](internal_.BasePaymentInitializeOptions.md#params)
- [paypalcommerce](internal_.BasePaymentInitializeOptions.md#paypalcommerce)
- [paypalexpress](internal_.BasePaymentInitializeOptions.md#paypalexpress)
- [square](internal_.BasePaymentInitializeOptions.md#square)
- [stripeupe](internal_.BasePaymentInitializeOptions.md#stripeupe)
- [stripev3](internal_.BasePaymentInitializeOptions.md#stripev3)
- [timeout](internal_.BasePaymentInitializeOptions.md#timeout)
- [worldpay](internal_.BasePaymentInitializeOptions.md#worldpay)

## Properties

### amazon

• `Optional` **amazon**: [`AmazonPayPaymentInitializeOptions`](internal_.AmazonPayPaymentInitializeOptions.md)

The options that are required to initialize the Amazon Pay payment
method. They can be omitted unless you need to support AmazonPay.

___

### amazonpay

• `Optional` **amazonpay**: [`AmazonPayV2PaymentInitializeOptions`](internal_.AmazonPayV2PaymentInitializeOptions.md)

The options that are required to initialize the AmazonPayV2 payment
method. They can be omitted unless you need to support AmazonPayV2.

___

### bluesnapv2

• `Optional` **bluesnapv2**: [`BlueSnapV2PaymentInitializeOptions`](internal_.BlueSnapV2PaymentInitializeOptions.md)

The options that are required to initialize the BlueSnapV2 payment method.
They can be omitted unless you need to support BlueSnapV2.

___

### bolt

• `Optional` **bolt**: [`BoltPaymentInitializeOptions`](internal_.BoltPaymentInitializeOptions.md)

The options that allow Bolt to load the client script and handle the checkout.
They can be omitted if Bolt's full checkout take over is intended.

___

### braintree

• `Optional` **braintree**: [`BraintreePaymentInitializeOptions`](internal_.BraintreePaymentInitializeOptions.md)

The options that are required to initialize the Braintree payment method.
They can be omitted unless you need to support Braintree.

___

### braintreevisacheckout

• `Optional` **braintreevisacheckout**: [`BraintreeVisaCheckoutPaymentInitializeOptions`](internal_.BraintreeVisaCheckoutPaymentInitializeOptions.md)

The options that are required to initialize the Visa Checkout payment
method provided by Braintree. They can be omitted unless you need to
support Visa Checkout.

___

### chasepay

• `Optional` **chasepay**: [`ChasePayInitializeOptions`](internal_.ChasePayInitializeOptions.md)

The options that are required to initialize the Chasepay payment method.
They can be omitted unless you need to support Chasepay.

___

### digitalriver

• `Optional` **digitalriver**: [`DigitalRiverPaymentInitializeOptions`](internal_.DigitalRiverPaymentInitializeOptions.md)

The options that are required to initialize the Digital River payment method.
They can be omitted unless you need to support Digital River.

___

### gatewayId

• `Optional` **gatewayId**: `string`

The identifier of the payment provider providing the payment method. This
option is only required if the provider offers multiple payment options.
i.e.: Adyen and Klarna.

#### Inherited from

[PaymentRequestOptions](internal_.PaymentRequestOptions.md).[gatewayId](internal_.PaymentRequestOptions.md#gatewayid)

___

### googlepayadyenv2

• `Optional` **googlepayadyenv2**: [`GooglePayPaymentInitializeOptions`](internal_.GooglePayPaymentInitializeOptions.md)

The options that are required to initialize the GooglePay Authorize.Net
payment method. They can be omitted unless you need to support GooglePay.

___

### googlepayadyenv3

• `Optional` **googlepayadyenv3**: [`GooglePayPaymentInitializeOptions`](internal_.GooglePayPaymentInitializeOptions.md)

The options that are required to initialize the GooglePay Authorize.Net
payment method. They can be omitted unless you need to support GooglePay.

___

### googlepayauthorizenet

• `Optional` **googlepayauthorizenet**: [`GooglePayPaymentInitializeOptions`](internal_.GooglePayPaymentInitializeOptions.md)

The options that are required to initialize the GooglePay Authorize.Net
payment method. They can be omitted unless you need to support GooglePay.

___

### googlepaybnz

• `Optional` **googlepaybnz**: [`GooglePayPaymentInitializeOptions`](internal_.GooglePayPaymentInitializeOptions.md)

The options that are required to initialize the GooglePay Authorize.Net
payment method. They can be omitted unless you need to support GooglePay.

___

### googlepaybraintree

• `Optional` **googlepaybraintree**: [`GooglePayPaymentInitializeOptions`](internal_.GooglePayPaymentInitializeOptions.md)

The options that are required to initialize the GooglePay Braintree payment method.
They can be omitted unless you need to support GooglePay.

___

### googlepaycheckoutcom

• `Optional` **googlepaycheckoutcom**: [`GooglePayPaymentInitializeOptions`](internal_.GooglePayPaymentInitializeOptions.md)

The options that are required to initialize the GooglePay Checkout.com payment method.
They can be omitted unless you need to support GooglePay.

___

### googlepaycybersourcev2

• `Optional` **googlepaycybersourcev2**: [`GooglePayPaymentInitializeOptions`](internal_.GooglePayPaymentInitializeOptions.md)

The options that are required to initialize the GooglePay CybersourceV2 payment method.
They can be omitted unless you need to support GooglePay.

___

### googlepayorbital

• `Optional` **googlepayorbital**: [`GooglePayPaymentInitializeOptions`](internal_.GooglePayPaymentInitializeOptions.md)

The options that are required to initialize the GooglePay payment method.
They can be omitted unless you need to support GooglePay.

___

### googlepaystripe

• `Optional` **googlepaystripe**: [`GooglePayPaymentInitializeOptions`](internal_.GooglePayPaymentInitializeOptions.md)

The options that are required to initialize the GooglePay Stripe payment method.
They can be omitted unless you need to support GooglePay.

___

### googlepaystripeupe

• `Optional` **googlepaystripeupe**: [`GooglePayPaymentInitializeOptions`](internal_.GooglePayPaymentInitializeOptions.md)

The options that are required to initialize the GooglePay Stripe payment method.
They can be omitted unless you need to support GooglePay.

___

### klarna

• `Optional` **klarna**: [`KlarnaPaymentInitializeOptions`](internal_.KlarnaPaymentInitializeOptions.md)

The options that are required to initialize the Klarna payment method.
They can be omitted unless you need to support Klarna.

___

### klarnav2

• `Optional` **klarnav2**: [`KlarnaV2PaymentInitializeOptions`](internal_.KlarnaV2PaymentInitializeOptions.md)

The options that are required to initialize the KlarnaV2 payment method.
They can be omitted unless you need to support KlarnaV2.

___

### masterpass

• `Optional` **masterpass**: [`MasterpassPaymentInitializeOptions`](internal_.MasterpassPaymentInitializeOptions.md)

The options that are required to initialize the Masterpass payment method.
They can be omitted unless you need to support Masterpass.

___

### methodId

• **methodId**: `string`

The identifier of the payment method.

#### Inherited from

[PaymentRequestOptions](internal_.PaymentRequestOptions.md).[methodId](internal_.PaymentRequestOptions.md#methodid)

___

### mollie

• `Optional` **mollie**: [`MolliePaymentInitializeOptions`](internal_.MolliePaymentInitializeOptions.md)

The options that are required to initialize the Mollie payment method.
They can be omitted unless you need to support Mollie.

___

### moneris

• `Optional` **moneris**: [`MonerisPaymentInitializeOptions`](internal_.MonerisPaymentInitializeOptions.md)

The options that are required to initialize the Moneris payment method.
They can be omitted unless you need to support Moneris.

___

### opy

• `Optional` **opy**: [`OpyPaymentInitializeOptions`](internal_.OpyPaymentInitializeOptions.md)

The options that are required to initialize the Opy payment
method. They can be omitted unless you need to support Opy.

___

### params

• `Optional` **params**: `Object`

The parameters of the request, if required.

#### Inherited from

[PaymentRequestOptions](internal_.PaymentRequestOptions.md).[params](internal_.PaymentRequestOptions.md#params)

___

### paypalcommerce

• `Optional` **paypalcommerce**: [`PaypalCommerceInitializeOptions`](../modules/internal_.md#paypalcommerceinitializeoptions)

The options that are required to initialize the PayPal Commerce payment method.
They can be omitted unless you need to support PayPal Commerce.

___

### paypalexpress

• `Optional` **paypalexpress**: [`PaypalExpressPaymentInitializeOptions`](internal_.PaypalExpressPaymentInitializeOptions.md)

The options that are required to initialize the PayPal Express payment method.
They can be omitted unless you need to support PayPal Express.

___

### square

• `Optional` **square**: [`SquarePaymentInitializeOptions`](internal_.SquarePaymentInitializeOptions.md)

The options that are required to initialize the Square payment method.
They can be omitted unless you need to support Square.

___

### stripeupe

• `Optional` **stripeupe**: [`StripeUPEPaymentInitializeOptions`](internal_.StripeUPEPaymentInitializeOptions.md)

The options that are required to initialize the StripeUPE payment method.
They can be omitted unless you need to support StripeUPE.

___

### stripev3

• `Optional` **stripev3**: [`StripeV3PaymentInitializeOptions`](internal_.StripeV3PaymentInitializeOptions.md)

The options that are required to initialize the Stripe payment method.
They can be omitted unless you need to support StripeV3.

___

### timeout

• `Optional` **timeout**: `default`

Provide this option if you want to cancel or time out the request. If the
timeout object completes before the request, the request will be
cancelled.

#### Inherited from

[PaymentRequestOptions](internal_.PaymentRequestOptions.md).[timeout](internal_.PaymentRequestOptions.md#timeout)

___

### worldpay

• `Optional` **worldpay**: [`WorldpayAccessPaymentInitializeOptions`](internal_.WorldpayAccessPaymentInitializeOptions.md)

The options that are required to initialize the Worldpay payment method.
They can be omitted unless you need to support Worldpay.
