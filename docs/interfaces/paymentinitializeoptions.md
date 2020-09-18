[@bigcommerce/checkout-sdk](../README.md) › [PaymentInitializeOptions](paymentinitializeoptions.md)

# Interface: PaymentInitializeOptions ‹**TParams**›

A set of options that are required to initialize the payment step of the
current checkout flow.

## Type parameters

▪ **TParams**

## Hierarchy

  ↳ [PaymentRequestOptions](paymentrequestoptions.md)

  ↳ **PaymentInitializeOptions**

## Index

### Properties

* [adyenv2](paymentinitializeoptions.md#optional-adyenv2)
* [amazon](paymentinitializeoptions.md#optional-amazon)
* [amazonpay](paymentinitializeoptions.md#optional-amazonpay)
* [bluesnapv2](paymentinitializeoptions.md#optional-bluesnapv2)
* [bolt](paymentinitializeoptions.md#optional-bolt)
* [braintree](paymentinitializeoptions.md#optional-braintree)
* [braintreevisacheckout](paymentinitializeoptions.md#optional-braintreevisacheckout)
* [chasepay](paymentinitializeoptions.md#optional-chasepay)
* [creditCard](paymentinitializeoptions.md#optional-creditcard)
* [gatewayId](paymentinitializeoptions.md#optional-gatewayid)
* [googlepayadyenv2](paymentinitializeoptions.md#optional-googlepayadyenv2)
* [googlepayauthorizenet](paymentinitializeoptions.md#optional-googlepayauthorizenet)
* [googlepaybraintree](paymentinitializeoptions.md#optional-googlepaybraintree)
* [googlepaycheckoutcom](paymentinitializeoptions.md#optional-googlepaycheckoutcom)
* [googlepaystripe](paymentinitializeoptions.md#optional-googlepaystripe)
* [klarna](paymentinitializeoptions.md#optional-klarna)
* [klarnav2](paymentinitializeoptions.md#optional-klarnav2)
* [masterpass](paymentinitializeoptions.md#optional-masterpass)
* [methodId](paymentinitializeoptions.md#methodid)
* [params](paymentinitializeoptions.md#optional-params)
* [paypalcommerce](paymentinitializeoptions.md#optional-paypalcommerce)
* [paypalexpress](paymentinitializeoptions.md#optional-paypalexpress)
* [square](paymentinitializeoptions.md#optional-square)
* [stripev3](paymentinitializeoptions.md#optional-stripev3)
* [timeout](paymentinitializeoptions.md#optional-timeout)

## Properties

### `Optional` adyenv2

• **adyenv2**? : *[AdyenV2PaymentInitializeOptions](adyenv2paymentinitializeoptions.md)*

The options that are required to initialize the AdyenV2 payment
method. They can be omitted unless you need to support AdyenV2.

___

### `Optional` amazon

• **amazon**? : *[AmazonPayPaymentInitializeOptions](amazonpaypaymentinitializeoptions.md)*

The options that are required to initialize the Amazon Pay payment
method. They can be omitted unless you need to support AmazonPay.

___

### `Optional` amazonpay

• **amazonpay**? : *[AmazonPayV2PaymentInitializeOptions](amazonpayv2paymentinitializeoptions.md)*

The options that are required to initialize the AmazonPayV2 payment
method. They can be omitted unless you need to support AmazonPayV2.

___

### `Optional` bluesnapv2

• **bluesnapv2**? : *[BlueSnapV2PaymentInitializeOptions](bluesnapv2paymentinitializeoptions.md)*

The options that are required to initialize the BlueSnapV2 payment method.
They can be omitted unless you need to support BlueSnapV2.

___

### `Optional` bolt

• **bolt**? : *[BoltPaymentInitializeOptions](boltpaymentinitializeoptions.md)*

The options that allow Bolt to load the client script and handle the checkout.
They can be omitted if Bolt's full checkout take over is intended.

___

### `Optional` braintree

• **braintree**? : *[BraintreePaymentInitializeOptions](braintreepaymentinitializeoptions.md)*

The options that are required to initialize the Braintree payment method.
They can be omitted unless you need to support Braintree.

___

### `Optional` braintreevisacheckout

• **braintreevisacheckout**? : *[BraintreeVisaCheckoutPaymentInitializeOptions](braintreevisacheckoutpaymentinitializeoptions.md)*

The options that are required to initialize the Visa Checkout payment
method provided by Braintree. They can be omitted unless you need to
support Visa Checkout.

___

### `Optional` chasepay

• **chasepay**? : *[ChasePayInitializeOptions](chasepayinitializeoptions.md)*

The options that are required to initialize the Chasepay payment method.
They can be omitted unless you need to support Chasepay.

___

### `Optional` creditCard

• **creditCard**? : *[CreditCardPaymentInitializeOptions](creditcardpaymentinitializeoptions.md)*

**`alpha`** 
Please note that this option is currently in an early stage of
development. Therefore the API is unstable and not ready for public
consumption.

___

### `Optional` gatewayId

• **gatewayId**? : *undefined | string*

*Inherited from [PaymentInitializeOptions](paymentinitializeoptions.md).[gatewayId](paymentinitializeoptions.md#optional-gatewayid)*

The identifier of the payment provider providing the payment method. This
option is only required if the provider offers multiple payment options.
i.e.: Adyen and Klarna.

___

### `Optional` googlepayadyenv2

• **googlepayadyenv2**? : *[GooglePayPaymentInitializeOptions](googlepaypaymentinitializeoptions.md)*

The options that are required to initialize the GooglePay Authorize.Net
payment method. They can be omitted unless you need to support GooglePay.

___

### `Optional` googlepayauthorizenet

• **googlepayauthorizenet**? : *[GooglePayPaymentInitializeOptions](googlepaypaymentinitializeoptions.md)*

The options that are required to initialize the GooglePay Authorize.Net
payment method. They can be omitted unless you need to support GooglePay.

___

### `Optional` googlepaybraintree

• **googlepaybraintree**? : *[GooglePayPaymentInitializeOptions](googlepaypaymentinitializeoptions.md)*

The options that are required to initialize the GooglePay Braintree payment method.
They can be omitted unless you need to support GooglePay.

___

### `Optional` googlepaycheckoutcom

• **googlepaycheckoutcom**? : *[GooglePayPaymentInitializeOptions](googlepaypaymentinitializeoptions.md)*

The options that are required to initialize the GooglePay Checkout.com payment method.
They can be omitted unless you need to support GooglePay.

___

### `Optional` googlepaystripe

• **googlepaystripe**? : *[GooglePayPaymentInitializeOptions](googlepaypaymentinitializeoptions.md)*

The options that are required to initialize the GooglePay Stripe payment method.
They can be omitted unless you need to support GooglePay.

___

### `Optional` klarna

• **klarna**? : *[KlarnaPaymentInitializeOptions](klarnapaymentinitializeoptions.md)*

The options that are required to initialize the Klarna payment method.
They can be omitted unless you need to support Klarna.

___

### `Optional` klarnav2

• **klarnav2**? : *[KlarnaV2PaymentInitializeOptions](klarnav2paymentinitializeoptions.md)*

The options that are required to initialize the KlarnaV2 payment method.
They can be omitted unless you need to support KlarnaV2.

___

### `Optional` masterpass

• **masterpass**? : *[MasterpassPaymentInitializeOptions](masterpasspaymentinitializeoptions.md)*

The options that are required to initialize the Masterpass payment method.
They can be omitted unless you need to support Masterpass.

___

###  methodId

• **methodId**: *string*

*Inherited from [PaymentInitializeOptions](paymentinitializeoptions.md).[methodId](paymentinitializeoptions.md#methodid)*

The identifier of the payment method.

___

### `Optional` params

• **params**? : *TParams*

*Inherited from [CheckoutButtonInitializeOptions](checkoutbuttoninitializeoptions.md).[params](checkoutbuttoninitializeoptions.md#optional-params)*

The parameters of the request, if required.

___

### `Optional` paypalcommerce

• **paypalcommerce**? : *[PaypalCommerceInitializeOptions](../README.md#paypalcommerceinitializeoptions)*

The options that are required to initialize the PayPal Commerce payment method.
They can be omitted unless you need to support PayPal Commerce.

___

### `Optional` paypalexpress

• **paypalexpress**? : *[PaypalExpressPaymentInitializeOptions](paypalexpresspaymentinitializeoptions.md)*

The options that are required to initialize the PayPal Express payment method.
They can be omitted unless you need to support PayPal Express.

___

### `Optional` square

• **square**? : *[SquarePaymentInitializeOptions](squarepaymentinitializeoptions.md)*

The options that are required to initialize the Square payment method.
They can be omitted unless you need to support Square.

___

### `Optional` stripev3

• **stripev3**? : *[StripeV3PaymentInitializeOptions](stripev3paymentinitializeoptions.md)*

The options that are required to initialize the Stripe payment method.
They can be omitted unless you need to support StripeV3.

___

### `Optional` timeout

• **timeout**? : *Timeout*

*Inherited from [CheckoutButtonInitializeOptions](checkoutbuttoninitializeoptions.md).[timeout](checkoutbuttoninitializeoptions.md#optional-timeout)*

Provide this option if you want to cancel or time out the request. If the
timeout object completes before the request, the request will be
cancelled.
