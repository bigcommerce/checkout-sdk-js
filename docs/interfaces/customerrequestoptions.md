[@bigcommerce/checkout-sdk](../README.md) › [CustomerRequestOptions](customerrequestoptions.md)

# Interface: CustomerRequestOptions ‹**TParams**›

A set of options for configuring any requests related to the customer step of
the current checkout flow.

Some payment methods have their own sign-in or sign-out flow. Therefore, you
need to indicate the method you want to use if you need to trigger a specific
flow for signing in or out a customer. Otherwise, these options are not required.

## Type parameters

▪ **TParams**

## Hierarchy

* [RequestOptions](requestoptions.md)

  ↳ **CustomerRequestOptions**

  ↳ [CustomerInitializeOptions](customerinitializeoptions.md)

## Index

### Properties

* [methodId](customerrequestoptions.md#optional-methodid)
* [params](customerrequestoptions.md#optional-params)
* [timeout](customerrequestoptions.md#optional-timeout)

## Properties

### `Optional` methodId

• **methodId**? : *undefined | string*

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
