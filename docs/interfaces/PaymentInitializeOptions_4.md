[@bigcommerce/checkout-sdk](../README.md) / PaymentInitializeOptions_4

# Interface: PaymentInitializeOptions\_4

A set of options that are required to initialize the payment step of the
current checkout flow.

## Hierarchy

- [`PaymentRequestOptions_2`](PaymentRequestOptions_2.md)

  ↳ **`PaymentInitializeOptions_4`**

## Table of contents

### Properties

- [adyenv2](PaymentInitializeOptions_4.md#adyenv2)
- [adyenv3](PaymentInitializeOptions_4.md#adyenv3)
- [amazon](PaymentInitializeOptions_4.md#amazon)
- [amazonpay](PaymentInitializeOptions_4.md#amazonpay)
- [applepay](PaymentInitializeOptions_4.md#applepay)
- [bluesnapv2](PaymentInitializeOptions_4.md#bluesnapv2)
- [bolt](PaymentInitializeOptions_4.md#bolt)
- [braintree](PaymentInitializeOptions_4.md#braintree)
- [braintreevisacheckout](PaymentInitializeOptions_4.md#braintreevisacheckout)
- [chasepay](PaymentInitializeOptions_4.md#chasepay)
- [creditCard](PaymentInitializeOptions_4.md#creditcard)
- [digitalriver](PaymentInitializeOptions_4.md#digitalriver)
- [gatewayId](PaymentInitializeOptions_4.md#gatewayid)
- [googlepayadyenv2](PaymentInitializeOptions_4.md#googlepayadyenv2)
- [googlepayadyenv3](PaymentInitializeOptions_4.md#googlepayadyenv3)
- [googlepayauthorizenet](PaymentInitializeOptions_4.md#googlepayauthorizenet)
- [googlepaybraintree](PaymentInitializeOptions_4.md#googlepaybraintree)
- [googlepaycheckoutcom](PaymentInitializeOptions_4.md#googlepaycheckoutcom)
- [googlepaycybersourcev2](PaymentInitializeOptions_4.md#googlepaycybersourcev2)
- [googlepayorbital](PaymentInitializeOptions_4.md#googlepayorbital)
- [googlepaystripe](PaymentInitializeOptions_4.md#googlepaystripe)
- [googlepaystripeupe](PaymentInitializeOptions_4.md#googlepaystripeupe)
- [klarna](PaymentInitializeOptions_4.md#klarna)
- [klarnav2](PaymentInitializeOptions_4.md#klarnav2)
- [masterpass](PaymentInitializeOptions_4.md#masterpass)
- [methodId](PaymentInitializeOptions_4.md#methodid)
- [mollie](PaymentInitializeOptions_4.md#mollie)
- [moneris](PaymentInitializeOptions_4.md#moneris)
- [opy](PaymentInitializeOptions_4.md#opy)
- [params](PaymentInitializeOptions_4.md#params)
- [paypalcommerce](PaymentInitializeOptions_4.md#paypalcommerce)
- [paypalexpress](PaymentInitializeOptions_4.md#paypalexpress)
- [square](PaymentInitializeOptions_4.md#square)
- [stripeupe](PaymentInitializeOptions_4.md#stripeupe)
- [stripev3](PaymentInitializeOptions_4.md#stripev3)
- [timeout](PaymentInitializeOptions_4.md#timeout)
- [worldpay](PaymentInitializeOptions_4.md#worldpay)

## Properties

### adyenv2

• `Optional` **adyenv2**: [`AdyenV2PaymentInitializeOptions`](AdyenV2PaymentInitializeOptions.md)

The options that are required to initialize the AdyenV2 payment
method. They can be omitted unless you need to support AdyenV2.

___

### adyenv3

• `Optional` **adyenv3**: [`AdyenV3PaymentInitializeOptions`](AdyenV3PaymentInitializeOptions.md)

The options that are required to initialize the AdyenV3 payment
method. They can be omitted unless you need to support AdyenV3.

___

### amazon

• `Optional` **amazon**: [`AmazonPayPaymentInitializeOptions`](AmazonPayPaymentInitializeOptions.md)

The options that are required to initialize the Amazon Pay payment
method. They can be omitted unless you need to support AmazonPay.

___

### amazonpay

• `Optional` **amazonpay**: [`AmazonPayV2PaymentInitializeOptions`](AmazonPayV2PaymentInitializeOptions.md)

The options that are required to initialize the AmazonPayV2 payment
method. They can be omitted unless you need to support AmazonPayV2.

___

### applepay

• `Optional` **applepay**: [`ApplePayPaymentInitializeOptions_2`](ApplePayPaymentInitializeOptions_2.md)

The options that are required to initialize the Apple Pay payment
method. They can be omitted unless you need to support AmazonPay.

___

### bluesnapv2

• `Optional` **bluesnapv2**: [`BlueSnapV2PaymentInitializeOptions`](BlueSnapV2PaymentInitializeOptions.md)

The options that are required to initialize the BlueSnapV2 payment method.
They can be omitted unless you need to support BlueSnapV2.

___

### bolt

• `Optional` **bolt**: [`BoltPaymentInitializeOptions`](BoltPaymentInitializeOptions.md)

The options that allow Bolt to load the client script and handle the checkout.
They can be omitted if Bolt's full checkout take over is intended.

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

• `Optional` **creditCard**: [`CreditCardPaymentInitializeOptions`](CreditCardPaymentInitializeOptions.md)

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

[PaymentRequestOptions_2](PaymentRequestOptions_2.md).[gatewayId](PaymentRequestOptions_2.md#gatewayid)

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

[PaymentRequestOptions_2](PaymentRequestOptions_2.md).[methodId](PaymentRequestOptions_2.md#methodid)

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

[PaymentRequestOptions_2](PaymentRequestOptions_2.md).[params](PaymentRequestOptions_2.md#params)

___

### paypalcommerce

• `Optional` **paypalcommerce**: [`PaypalCommercePaymentInitializeOptions`](PaypalCommercePaymentInitializeOptions.md) \| [`PaypalCommerceCreditCardPaymentInitializeOptions`](PaypalCommerceCreditCardPaymentInitializeOptions.md)

The options that are required to initialize the PayPal Commerce payment method.
They can be omitted unless you need to support PayPal Commerce.

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

[PaymentRequestOptions_2](PaymentRequestOptions_2.md).[timeout](PaymentRequestOptions_2.md#timeout)

___

### worldpay

• `Optional` **worldpay**: [`WorldpayPaymentInitializeOptions`](WorldpayPaymentInitializeOptions.md)

The options that are required to initialize the Worldpay payment method.
They can be omitted unless you need to support Worldpay.
