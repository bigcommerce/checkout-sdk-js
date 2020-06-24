[@bigcommerce/checkout-sdk](../README.md) › [CheckoutButtonOptions](checkoutbuttonoptions.md)

# Interface: CheckoutButtonOptions ‹**TParams**›

The set of options for configuring the checkout button.

## Type parameters

▪ **TParams**

## Hierarchy

* [RequestOptions](requestoptions.md)

  ↳ **CheckoutButtonOptions**

  ↳ [CheckoutButtonInitializeOptions](checkoutbuttoninitializeoptions.md)

## Index

### Properties

* [methodId](checkoutbuttonoptions.md#methodid)
* [params](checkoutbuttonoptions.md#optional-params)
* [timeout](checkoutbuttonoptions.md#optional-timeout)

## Properties

###  methodId

• **methodId**: *[CheckoutButtonMethodType](../enums/checkoutbuttonmethodtype.md)*

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
