[@bigcommerce/checkout-sdk](../README.md) > [PaymentInitializeOptions](../interfaces/paymentinitializeoptions.md)

# PaymentInitializeOptions

A set of options that are required to initialize the payment step of the current checkout flow.

## Hierarchy

↳  [PaymentRequestOptions](paymentrequestoptions.md)

**↳ PaymentInitializeOptions**

## Index

### Properties

* [amazon](paymentinitializeoptions.md#amazon)
* [braintree](paymentinitializeoptions.md#braintree)
* [braintreevisacheckout](paymentinitializeoptions.md#braintreevisacheckout)
* [gatewayId](paymentinitializeoptions.md#gatewayid)
* [klarna](paymentinitializeoptions.md#klarna)
* [methodId](paymentinitializeoptions.md#methodid)
* [square](paymentinitializeoptions.md#square)
* [timeout](paymentinitializeoptions.md#timeout)

---

## Properties

<a id="amazon"></a>

### `<Optional>` amazon

**● amazon**: *[AmazonPayPaymentInitializeOptions](amazonpaypaymentinitializeoptions.md)*

The options that are required to initialize the Amazon Pay payment method. They can be omitted unless you need to support AmazonPay.

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
<a id="gatewayid"></a>

### `<Optional>` gatewayId

**● gatewayId**: * `undefined` &#124; `string`
*

The identifier of the payment provider providing the payment method. This option is only required if the provider offers multiple payment options. i.e.: Adyen and Klarna.

___
<a id="klarna"></a>

### `<Optional>` klarna

**● klarna**: *[KlarnaPaymentInitializeOptions](klarnapaymentinitializeoptions.md)*

The options that are required to initialize the Klarna payment method. They can be omitted unless you need to support Klarna.

___
<a id="methodid"></a>

###  methodId

**● methodId**: *`string`*

The identifier of the payment method.

___
<a id="square"></a>

### `<Optional>` square

**● square**: *[SquarePaymentInitializeOptions](squarepaymentinitializeoptions.md)*

The options that are required to initialize the Square payment method. They can be omitted unless you need to support Square.

___
<a id="timeout"></a>

### `<Optional>` timeout

**● timeout**: *`Timeout`*

Provide this option if you want to cancel or time out the request. If the timeout object completes before the request, the request will be cancelled.

___

