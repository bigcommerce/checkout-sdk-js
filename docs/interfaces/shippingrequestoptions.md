[@bigcommerce/checkout-sdk](../README.md) > [ShippingRequestOptions](../interfaces/shippingrequestoptions.md)

# ShippingRequestOptions

A set of options for configuring any requests related to the shipping step of the current checkout flow.

Some payment methods have their own shipping configuration flow. Therefore, you need to specify the method you intend to use if you want to trigger a specific flow for setting the shipping address or option. Otherwise, these options are not required.

## Type parameters

#### TParams 
## Hierarchy

 [RequestOptions](requestoptions.md)

**↳ ShippingRequestOptions**

↳  [ShippingInitializeOptions](shippinginitializeoptions.md)

## Index

### Properties

* [methodId](shippingrequestoptions.md#methodid)
* [params](shippingrequestoptions.md#params)
* [timeout](shippingrequestoptions.md#timeout)

---

## Properties

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

