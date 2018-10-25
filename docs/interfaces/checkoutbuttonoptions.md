[@bigcommerce/checkout-sdk](../README.md) > [CheckoutButtonOptions](../interfaces/checkoutbuttonoptions.md)

# CheckoutButtonOptions

The set of options for configuring the checkout button.

## Type parameters

#### TParams 
## Hierarchy

 [RequestOptions](requestoptions.md)

**↳ CheckoutButtonOptions**

↳  [CheckoutButtonInitializeOptions](checkoutbuttoninitializeoptions.md)

## Index

### Properties

* [methodId](checkoutbuttonoptions.md#methodid)
* [params](checkoutbuttonoptions.md#params)
* [timeout](checkoutbuttonoptions.md#timeout)

---

## Properties

<a id="methodid"></a>

###  methodId

**● methodId**: *[CheckoutButtonMethodType](../enums/checkoutbuttonmethodtype.md)*

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

