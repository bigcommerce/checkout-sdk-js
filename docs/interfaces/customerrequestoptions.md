[@bigcommerce/checkout-sdk](../README.md) > [CustomerRequestOptions](../interfaces/customerrequestoptions.md)

# CustomerRequestOptions

A set of options for configuring any requests related to the customer step of the current checkout flow.

Some payment methods have their own sign-in or sign-out flow. Therefore, you need to indicate the method you want to use if you need to trigger a specific flow for signing in or out a customer. Otherwise, these options are not required.

## Type parameters

#### TParams 
## Hierarchy

 [RequestOptions](requestoptions.md)

**↳ CustomerRequestOptions**

↳  [CustomerInitializeOptions](customerinitializeoptions.md)

## Index

### Properties

* [methodId](customerrequestoptions.md#methodid)
* [params](customerrequestoptions.md#params)
* [timeout](customerrequestoptions.md#timeout)

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

