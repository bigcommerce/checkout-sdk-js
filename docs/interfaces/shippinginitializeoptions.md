[@bigcommerce/checkout-sdk](../README.md) › [ShippingInitializeOptions](shippinginitializeoptions.md)

# Interface: ShippingInitializeOptions ‹**T**›

A set of options that are required to initialize the shipping step of the
current checkout flow.

Some payment methods have specific requirements for setting the shipping
details for checkout. For example, Amazon Pay requires the customer to enter
their shipping address using their address book widget. As a result, you may
need to provide additional information in order to initialize the shipping
step of checkout.

## Type parameters

▪ **T**

## Hierarchy

  ↳ [ShippingRequestOptions](shippingrequestoptions.md)‹T›

  ↳ **ShippingInitializeOptions**

## Index

### Properties

* [amazon](shippinginitializeoptions.md#optional-amazon)
* [amazonpay](shippinginitializeoptions.md#optional-amazonpay)
* [methodId](shippinginitializeoptions.md#optional-methodid)
* [params](shippinginitializeoptions.md#optional-params)
* [timeout](shippinginitializeoptions.md#optional-timeout)

## Properties

### `Optional` amazon

• **amazon**? : *[AmazonPayShippingInitializeOptions](amazonpayshippinginitializeoptions.md)*

The options that are required to initialize the shipping step of checkout
when using Amazon Pay.

___

### `Optional` amazonpay

• **amazonpay**? : *[AmazonPayV2ShippingInitializeOptions](amazonpayv2shippinginitializeoptions.md)*

The options that are required to initialize the shipping step of checkout
when using AmazonPayV2.

**`alpha`** 

___

### `Optional` methodId

• **methodId**? : *undefined | string*

*Inherited from [ShippingInitializeOptions](shippinginitializeoptions.md).[methodId](shippinginitializeoptions.md#optional-methodid)*

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
