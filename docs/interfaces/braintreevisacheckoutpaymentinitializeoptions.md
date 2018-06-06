[@bigcommerce/checkout-sdk](../README.md) > [BraintreeVisaCheckoutPaymentInitializeOptions](../interfaces/braintreevisacheckoutpaymentinitializeoptions.md)

# BraintreeVisaCheckoutPaymentInitializeOptions

A set of options that are required to initialize the Visa Checkout payment method provided by Braintree.

If the customer chooses to pay with Visa Checkout, they will be asked to enter their payment details via a modal. You can hook into events emitted by the modal by providing the callbacks listed below.

## Hierarchy

**BraintreeVisaCheckoutPaymentInitializeOptions**

## Index

### Methods

* [onError](braintreevisacheckoutpaymentinitializeoptions.md#onerror)
* [onPaymentSelect](braintreevisacheckoutpaymentinitializeoptions.md#onpaymentselect)

---

## Methods

<a id="onerror"></a>

### `<Optional>` onError

▸ **onError**(error: *`Error`*): `void`

A callback that gets called when Visa Checkout fails to initialize or selects a payment option.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| error | `Error` |  The error object describing the failure. |

**Returns:** `void`

___
<a id="onpaymentselect"></a>

### `<Optional>` onPaymentSelect

▸ **onPaymentSelect**(): `void`

A callback that gets called when the customer selects a payment option.

**Returns:** `void`

___

