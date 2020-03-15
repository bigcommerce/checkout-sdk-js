[@bigcommerce/checkout-sdk](../README.md) > [PaymentInitializeOptions](../interfaces/paymentinitializeoptions.md)

# PaymentInitializeOptions

A set of options that are required to initialize the payment step of the current checkout flow.

## Type parameters

#### TParams 
## Hierarchy

↳  [PaymentRequestOptions](paymentrequestoptions.md)

**↳ PaymentInitializeOptions**

## Index

### Properties

* [adyenv2](paymentinitializeoptions.md#adyenv2)
* [amazon](paymentinitializeoptions.md#amazon)
* [bluesnapv2](paymentinitializeoptions.md#bluesnapv2)
* [braintree](paymentinitializeoptions.md#braintree)
* [braintreevisacheckout](paymentinitializeoptions.md#braintreevisacheckout)
* [chasepay](paymentinitializeoptions.md#chasepay)
* [creditCard](paymentinitializeoptions.md#creditcard)
* [gatewayId](paymentinitializeoptions.md#gatewayid)
* [googlepayauthorizenet](paymentinitializeoptions.md#googlepayauthorizenet)
* [googlepaybraintree](paymentinitializeoptions.md#googlepaybraintree)
* [googlepaystripe](paymentinitializeoptions.md#googlepaystripe)
* [klarna](paymentinitializeoptions.md#klarna)
* [klarnav2](paymentinitializeoptions.md#klarnav2)
* [masterpass](paymentinitializeoptions.md#masterpass)
* [methodId](paymentinitializeoptions.md#methodid)
* [params](paymentinitializeoptions.md#params)
* [paypalexpress](paymentinitializeoptions.md#paypalexpress)
* [square](paymentinitializeoptions.md#square)
* [stripev3](paymentinitializeoptions.md#stripev3)
* [timeout](paymentinitializeoptions.md#timeout)

---

## Properties

<a id="adyenv2"></a>

### `<Optional>` adyenv2

**● adyenv2**: *[AdyenV2PaymentInitializeOptions](adyenv2paymentinitializeoptions.md)*

The options that are required to initialize the AdyenV2 payment method. They can be omitted unless you need to support AdyenV2.

___
<a id="amazon"></a>

### `<Optional>` amazon

**● amazon**: *[AmazonPayPaymentInitializeOptions](amazonpaypaymentinitializeoptions.md)*

The options that are required to initialize the Amazon Pay payment method. They can be omitted unless you need to support AmazonPay.

___
<a id="bluesnapv2"></a>

### `<Optional>` bluesnapv2

**● bluesnapv2**: *[BlueSnapV2PaymentInitializeOptions](bluesnapv2paymentinitializeoptions.md)*

The options that are required to initialize the BlueSnapV2 payment method. They can be omitted unless you need to support BlueSnapV2.

___
<a id="braintree"></a>

### `<Optional>` braintree

**● braintree**: *[BraintreePaymentInitializeOptions](braintreepaymentinitializeoptions.md)*

The options that are required to initialize the Braintree payment method. They can be omitted unless you need to support Braintree.

___
<a id="braintreevisacheckout"></a>

### `<Optional>` braintreevisacheckout

**● braintreevisacheckout**: *[BraintreeVisaCheckoutPaymentInitializeOptions](braintreevisacheckoutpaymentinitializeoptions.md)*

The options that are required to initialize the Visa Checkout payment method provided by Braintree. They can be omitted unless you need to support Visa Checkout.

___
<a id="chasepay"></a>

### `<Optional>` chasepay

**● chasepay**: *[ChasePayInitializeOptions](chasepayinitializeoptions.md)*

The options that are required to initialize the Chasepay payment method. They can be omitted unless you need to support Chasepay.

___
<a id="creditcard"></a>

### `<Optional>` creditCard

**● creditCard**: *[CreditCardPaymentInitializeOptions](creditcardpaymentinitializeoptions.md)*

*__alpha__*: Please note that this option is currently in an early stage of development. Therefore the API is unstable and not ready for public consumption.

___
<a id="gatewayid"></a>

### `<Optional>` gatewayId

**● gatewayId**: * `undefined` &#124; `string`
*

The identifier of the payment provider providing the payment method. This option is only required if the provider offers multiple payment options. i.e.: Adyen and Klarna.

___
<a id="googlepayauthorizenet"></a>

### `<Optional>` googlepayauthorizenet

**● googlepayauthorizenet**: *[GooglePayPaymentInitializeOptions](googlepaypaymentinitializeoptions.md)*

The options that are required to initialize the GooglePay Authorize.Net payment method. They can be omitted unless you need to support GooglePay.

___
<a id="googlepaybraintree"></a>

### `<Optional>` googlepaybraintree

**● googlepaybraintree**: *[GooglePayPaymentInitializeOptions](googlepaypaymentinitializeoptions.md)*

The options that are required to initialize the GooglePay Braintree payment method. They can be omitted unless you need to support GooglePay.

___
<a id="googlepaystripe"></a>

### `<Optional>` googlepaystripe

**● googlepaystripe**: *[GooglePayPaymentInitializeOptions](googlepaypaymentinitializeoptions.md)*

The options that are required to initialize the GooglePay Stripe payment method. They can be omitted unless you need to support GooglePay.

___
<a id="klarna"></a>

### `<Optional>` klarna

**● klarna**: *[KlarnaPaymentInitializeOptions](klarnapaymentinitializeoptions.md)*

The options that are required to initialize the Klarna payment method. They can be omitted unless you need to support Klarna.

___
<a id="klarnav2"></a>

### `<Optional>` klarnav2

**● klarnav2**: *[KlarnaV2PaymentInitializeOptions](klarnav2paymentinitializeoptions.md)*

The options that are required to initialize the KlarnaV2 payment method. They can be omitted unless you need to support KlarnaV2.

___
<a id="masterpass"></a>

### `<Optional>` masterpass

**● masterpass**: *[MasterpassPaymentInitializeOptions](masterpasspaymentinitializeoptions.md)*

The options that are required to initialize the Masterpass payment method. They can be omitted unless you need to support Masterpass.

___
<a id="methodid"></a>

###  methodId

**● methodId**: *`string`*

The identifier of the payment method.

___
<a id="params"></a>

### `<Optional>` params

**● params**: *[TParams]()*

The parameters of the request, if required.

___
<a id="paypalexpress"></a>

### `<Optional>` paypalexpress

**● paypalexpress**: *[PaypalExpressPaymentInitializeOptions](paypalexpresspaymentinitializeoptions.md)*

The options that are required to initialize the PayPal Express payment method. They can be omitted unless you need to support PayPal Express.

___
<a id="square"></a>

### `<Optional>` square

**● square**: *[SquarePaymentInitializeOptions](squarepaymentinitializeoptions.md)*

The options that are required to initialize the Square payment method. They can be omitted unless you need to support Square.

___
<a id="stripev3"></a>

### `<Optional>` stripev3

**● stripev3**: *[StripeV3PaymentInitializeOptions](stripev3paymentinitializeoptions.md)*

The options that are required to initialize the Stripe payment method. They can be omitted unless you need to support StripeV3.

___
<a id="timeout"></a>

### `<Optional>` timeout

**● timeout**: *`Timeout`*

Provide this option if you want to cancel or time out the request. If the timeout object completes before the request, the request will be cancelled.

___

