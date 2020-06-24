[@bigcommerce/checkout-sdk](../README.md) › [PaymentRequestOptions](paymentrequestoptions.md)

# Interface: PaymentRequestOptions ‹**TParams**›

The set of options for configuring any requests related to the payment step of
the current checkout flow.

## Type parameters

▪ **TParams**

## Hierarchy

* [RequestOptions](requestoptions.md)

  ↳ **PaymentRequestOptions**

  ↳ [PaymentInitializeOptions](paymentinitializeoptions.md)

## Index

### Properties

* [gatewayId](paymentrequestoptions.md#optional-gatewayid)
* [methodId](paymentrequestoptions.md#methodid)
* [params](paymentrequestoptions.md#optional-params)
* [timeout](paymentrequestoptions.md#optional-timeout)

## Properties

### `Optional` gatewayId

• **gatewayId**? : *undefined | string*

The identifier of the payment provider providing the payment method. This
option is only required if the provider offers multiple payment options.
i.e.: Adyen and Klarna.

___

###  methodId

• **methodId**: *string*

The identifier of the payment method.

___

### `Optional` params

• **params**? : *TParams*

*Inherited from [CheckoutButtonInitializeOptions](checkoutbuttoninitializeoptions.md).[params](checkoutbuttoninitializeoptions.md#optional-params)*

The parameters of the request, if required.

___

### `Optional` timeout

• **timeout**? : *Timeout*

*Inherited from [CheckoutButtonInitializeOptions](checkoutbuttoninitializeoptions.md).[timeout](checkoutbuttoninitializeoptions.md#optional-timeout)*

Provide this option if you want to cancel or time out the request. If the
timeout object completes before the request, the request will be
cancelled.
