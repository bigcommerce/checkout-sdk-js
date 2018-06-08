[@bigcommerce/checkout-sdk](../README.md) > [PaymentRequestOptions](../interfaces/paymentrequestoptions.md)

# PaymentRequestOptions

The set of options for configuring any requests related to the payment step of the current checkout flow.

## Type parameters

#### TParams 
## Hierarchy

 [RequestOptions](requestoptions.md)

**↳ PaymentRequestOptions**

↳  [PaymentInitializeOptions](paymentinitializeoptions.md)

## Index

### Properties

* [gatewayId](paymentrequestoptions.md#gatewayid)
* [methodId](paymentrequestoptions.md#methodid)
* [params](paymentrequestoptions.md#params)
* [timeout](paymentrequestoptions.md#timeout)

---

## Properties

<a id="gatewayid"></a>

### `<Optional>` gatewayId

**● gatewayId**: * `undefined` &#124; `string`
*

The identifier of the payment provider providing the payment method. This option is only required if the provider offers multiple payment options. i.e.: Adyen and Klarna.

___
<a id="methodid"></a>

###  methodId

**● methodId**: *`string`*

The identifier of the payment method.

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

