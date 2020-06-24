[@bigcommerce/checkout-sdk](../README.md) › [RequestOptions](requestoptions.md)

# Interface: RequestOptions ‹**TParams**›

A set of options for configuring an asynchronous request.

## Type parameters

▪ **TParams**

## Hierarchy

* **RequestOptions**

  ↳ [CheckoutButtonOptions](checkoutbuttonoptions.md)

  ↳ [CustomerRequestOptions](customerrequestoptions.md)

  ↳ [PaymentRequestOptions](paymentrequestoptions.md)

  ↳ [ShippingRequestOptions](shippingrequestoptions.md)

## Index

### Properties

* [params](requestoptions.md#optional-params)
* [timeout](requestoptions.md#optional-timeout)

## Properties

### `Optional` params

• **params**? : *TParams*

The parameters of the request, if required.

___

### `Optional` timeout

• **timeout**? : *Timeout*

Provide this option if you want to cancel or time out the request. If the
timeout object completes before the request, the request will be
cancelled.
