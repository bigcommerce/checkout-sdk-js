[@bigcommerce/checkout-sdk](../README.md) › [ShippingRequestOptions](shippingrequestoptions.md)

# Interface: ShippingRequestOptions ‹**T**›

A set of options for configuring any requests related to the shipping step of
the current checkout flow.

Some payment methods have their own shipping configuration flow. Therefore,
you need to specify the method you intend to use if you want to trigger a
specific flow for setting the shipping address or option. Otherwise, these
options are not required.

## Type parameters

▪ **T**

## Hierarchy

* [RequestOptions](requestoptions.md)‹T›

  ↳ **ShippingRequestOptions**

  ↳ [ShippingInitializeOptions](shippinginitializeoptions.md)

## Index

### Properties

* [methodId](shippingrequestoptions.md#optional-methodid)
* [params](shippingrequestoptions.md#optional-params)
* [timeout](shippingrequestoptions.md#optional-timeout)

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
