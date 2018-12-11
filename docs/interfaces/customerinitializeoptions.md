[@bigcommerce/checkout-sdk](../README.md) > [CustomerInitializeOptions](../interfaces/customerinitializeoptions.md)

# CustomerInitializeOptions

A set of options that are required to initialize the customer step of the current checkout flow.

Some payment methods have specific requirements for setting the customer details for checkout. For example, Amazon Pay requires the customer to sign in using their sign-in button. As a result, you may need to provide additional information in order to initialize the customer step of checkout.

## Type parameters

#### TParams 
## Hierarchy

↳  [CustomerRequestOptions](customerrequestoptions.md)

**↳ CustomerInitializeOptions**

## Index

### Properties

* [amazon](customerinitializeoptions.md#amazon)
* [braintreevisacheckout](customerinitializeoptions.md#braintreevisacheckout)
* [chasepay](customerinitializeoptions.md#chasepay)
* [googlepaybraintree](customerinitializeoptions.md#googlepaybraintree)
* [googlepaystripe](customerinitializeoptions.md#googlepaystripe)
* [masterpass](customerinitializeoptions.md#masterpass)
* [methodId](customerinitializeoptions.md#methodid)
* [params](customerinitializeoptions.md#params)
* [timeout](customerinitializeoptions.md#timeout)

---

## Properties

<a id="amazon"></a>

### `<Optional>` amazon

**● amazon**: *[AmazonPayCustomerInitializeOptions](amazonpaycustomerinitializeoptions.md)*

The options that are required to initialize the customer step of checkout when using Amazon Pay.

___
<a id="braintreevisacheckout"></a>

### `<Optional>` braintreevisacheckout

**● braintreevisacheckout**: *[BraintreeVisaCheckoutCustomerInitializeOptions](braintreevisacheckoutcustomerinitializeoptions.md)*

The options that are required to initialize the customer step of checkout when using Visa Checkout provided by Braintree.

___
<a id="chasepay"></a>

### `<Optional>` chasepay

**● chasepay**: *[ChasePayCustomerInitializeOptions](chasepaycustomerinitializeoptions.md)*

The options that are required to initialize the Chasepay payment method. They can be omitted unless you need to support Chasepay.

___
<a id="googlepaybraintree"></a>

### `<Optional>` googlepaybraintree

**● googlepaybraintree**: *[GooglePayCustomerInitializeOptions](googlepaycustomerinitializeoptions.md)*

The options that are required to initialize the GooglePay payment method. They can be omitted unless you need to support GooglePay.

___
<a id="googlepaystripe"></a>

### `<Optional>` googlepaystripe

**● googlepaystripe**: *[GooglePayCustomerInitializeOptions](googlepaycustomerinitializeoptions.md)*

The options that are required to initialize the GooglePay payment method. They can be omitted unless you need to support GooglePay.

___
<a id="masterpass"></a>

### `<Optional>` masterpass

**● masterpass**: *[MasterpassCustomerInitializeOptions](masterpasscustomerinitializeoptions.md)*

The options that are required to initialize the Masterpass payment method. They can be omitted unless you need to support Masterpass.

___
<a id="methodid"></a>

### `<Optional>` methodId

**● methodId**: * `undefined` &#124; `string`
*

___
<a id="params"></a>

### `<Optional>` params

**● params**: *[TParams]()*

The parameters of the request, if required.

___
<a id="timeout"></a>

### `<Optional>` timeout

**● timeout**: *`Timeout`*

Provide this option if you want to cancel or time out the request. If the timeout object completes before the request, the request will be cancelled.

___

