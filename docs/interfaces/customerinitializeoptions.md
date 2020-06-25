[@bigcommerce/checkout-sdk](../README.md) › [CustomerInitializeOptions](customerinitializeoptions.md)

# Interface: CustomerInitializeOptions ‹**TParams**›

A set of options that are required to initialize the customer step of the
current checkout flow.

Some payment methods have specific requirements for setting the customer
details for checkout. For example, Amazon Pay requires the customer to sign in
using their sign-in button. As a result, you may need to provide additional
information in order to initialize the customer step of checkout.

## Type parameters

▪ **TParams**

## Hierarchy

  ↳ [CustomerRequestOptions](customerrequestoptions.md)

  ↳ **CustomerInitializeOptions**

## Index

### Properties

* [amazon](customerinitializeoptions.md#optional-amazon)
* [amazonpay](customerinitializeoptions.md#optional-amazonpay)
* [braintreevisacheckout](customerinitializeoptions.md#optional-braintreevisacheckout)
* [chasepay](customerinitializeoptions.md#optional-chasepay)
* [googlepayadyenv2](customerinitializeoptions.md#optional-googlepayadyenv2)
* [googlepayauthorizenet](customerinitializeoptions.md#optional-googlepayauthorizenet)
* [googlepaybraintree](customerinitializeoptions.md#optional-googlepaybraintree)
* [googlepaycheckoutcom](customerinitializeoptions.md#optional-googlepaycheckoutcom)
* [googlepaystripe](customerinitializeoptions.md#optional-googlepaystripe)
* [masterpass](customerinitializeoptions.md#optional-masterpass)
* [methodId](customerinitializeoptions.md#optional-methodid)
* [params](customerinitializeoptions.md#optional-params)
* [timeout](customerinitializeoptions.md#optional-timeout)

## Properties

### `Optional` amazon

• **amazon**? : *[AmazonPayCustomerInitializeOptions](amazonpaycustomerinitializeoptions.md)*

The options that are required to initialize the customer step of checkout
when using Amazon Pay.

___

### `Optional` amazonpay

• **amazonpay**? : *[AmazonPayV2CustomerInitializeOptions](amazonpayv2customerinitializeoptions.md)*

The options that are required to initialize the customer step of checkout
when using AmazonPayV2.

**`alpha`** 

___

### `Optional` braintreevisacheckout

• **braintreevisacheckout**? : *[BraintreeVisaCheckoutCustomerInitializeOptions](braintreevisacheckoutcustomerinitializeoptions.md)*

The options that are required to initialize the customer step of checkout
when using Visa Checkout provided by Braintree.

___

### `Optional` chasepay

• **chasepay**? : *[ChasePayCustomerInitializeOptions](chasepaycustomerinitializeoptions.md)*

The options that are required to initialize the Chasepay payment method.
They can be omitted unless you need to support Chasepay.

___

### `Optional` googlepayadyenv2

• **googlepayadyenv2**? : *[GooglePayCustomerInitializeOptions](googlepaycustomerinitializeoptions.md)*

The options that are required to initialize the GooglePay payment method.
They can be omitted unless you need to support GooglePay.

___

### `Optional` googlepayauthorizenet

• **googlepayauthorizenet**? : *[GooglePayCustomerInitializeOptions](googlepaycustomerinitializeoptions.md)*

The options that are required to initialize the GooglePay payment method.
They can be omitted unless you need to support GooglePay.

___

### `Optional` googlepaybraintree

• **googlepaybraintree**? : *[GooglePayCustomerInitializeOptions](googlepaycustomerinitializeoptions.md)*

The options that are required to initialize the GooglePay payment method.
They can be omitted unless you need to support GooglePay.

___

### `Optional` googlepaycheckoutcom

• **googlepaycheckoutcom**? : *[GooglePayCustomerInitializeOptions](googlepaycustomerinitializeoptions.md)*

The options that are required to initialize the GooglePay payment method.
They can be omitted unless you need to support GooglePay.

___

### `Optional` googlepaystripe

• **googlepaystripe**? : *[GooglePayCustomerInitializeOptions](googlepaycustomerinitializeoptions.md)*

The options that are required to initialize the GooglePay payment method.
They can be omitted unless you need to support GooglePay.

___

### `Optional` masterpass

• **masterpass**? : *[MasterpassCustomerInitializeOptions](masterpasscustomerinitializeoptions.md)*

The options that are required to initialize the Masterpass payment method.
They can be omitted unless you need to support Masterpass.

___

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
