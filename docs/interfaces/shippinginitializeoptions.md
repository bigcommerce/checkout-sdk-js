[@bigcommerce/checkout-sdk](../README.md) > [ShippingInitializeOptions](../interfaces/shippinginitializeoptions.md)

# ShippingInitializeOptions

A set of options that are required to initialize the shipping step of the current checkout flow.

Some payment methods have specific requirements for setting the shipping details for checkout. For example, Amazon Pay requires the customer to enter their shipping address using their address book widget. As a result, you may need to provide additional information in order to initialize the shipping step of checkout.

## Type parameters

#### TParams 
## Hierarchy

↳  [ShippingRequestOptions](shippingrequestoptions.md)

**↳ ShippingInitializeOptions**

## Index

### Properties

* [amazon](shippinginitializeoptions.md#amazon)
* [methodId](shippinginitializeoptions.md#methodid)
* [params](shippinginitializeoptions.md#params)
* [timeout](shippinginitializeoptions.md#timeout)

---

## Properties

<a id="amazon"></a>

### `<Optional>` amazon

**● amazon**: *[AmazonPayShippingInitializeOptions](amazonpayshippinginitializeoptions.md)*

The options that are required to initialize the shipping step of checkout when using Amazon Pay.

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

