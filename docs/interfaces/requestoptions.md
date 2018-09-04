[@bigcommerce/checkout-sdk](../README.md) > [RequestOptions](../interfaces/requestoptions.md)

# RequestOptions

A set of options for configuring an asynchronous request.

## Type parameters

#### TParams 
## Hierarchy

**RequestOptions**

↳  [CheckoutButtonOptions](checkoutbuttonoptions.md)

↳  [CustomerRequestOptions](customerrequestoptions.md)

↳  [PaymentRequestOptions](paymentrequestoptions.md)

↳  [ShippingRequestOptions](shippingrequestoptions.md)

## Index

### Properties

* [params](requestoptions.md#params)
* [timeout](requestoptions.md#timeout)

---

## Properties

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

