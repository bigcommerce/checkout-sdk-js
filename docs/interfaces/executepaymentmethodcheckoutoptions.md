[@bigcommerce/checkout-sdk](../README.md) › [ExecutePaymentMethodCheckoutOptions](executepaymentmethodcheckoutoptions.md)

# Interface: ExecutePaymentMethodCheckoutOptions ‹**TParams**›

A set of options that are required to pass the customer step of the
current checkout flow.

Some payment methods have specific suggestion for customer to pass
the customer step. For example, Bolt suggests the customer to use
their custom checkout with prefilled form values. As a result, you
may need to provide additional information, error handler or callback
to execution method.

## Type parameters

▪ **TParams**

## Hierarchy

  ↳ [CustomerRequestOptions](customerrequestoptions.md)

  ↳ **ExecutePaymentMethodCheckoutOptions**

## Index

### Properties

* [methodId](executepaymentmethodcheckoutoptions.md#optional-methodid)
* [params](executepaymentmethodcheckoutoptions.md#optional-params)
* [timeout](executepaymentmethodcheckoutoptions.md#optional-timeout)

### Methods

* [continueWithCheckoutCallback](executepaymentmethodcheckoutoptions.md#optional-continuewithcheckoutcallback)

## Properties

### `Optional` methodId

• **methodId**? : *undefined | string*

*Inherited from [CustomerInitializeOptions](customerinitializeoptions.md).[methodId](customerinitializeoptions.md#optional-methodid)*

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

## Methods

### `Optional` continueWithCheckoutCallback

▸ **continueWithCheckoutCallback**(): *void*

**Returns:** *void*
