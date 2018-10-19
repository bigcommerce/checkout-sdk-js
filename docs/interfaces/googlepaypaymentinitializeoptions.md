[@bigcommerce/checkout-sdk](../README.md) > [GooglePayPaymentInitializeOptions](../interfaces/googlepaypaymentinitializeoptions.md)

# GooglePayPaymentInitializeOptions

A set of options that are required to initialize the GooglePay payment method

If the customer chooses to pay with GooglePay, they will be asked to enter their payment details via a modal. You can hook into events emitted by the modal by providing the callbacks listed below.

## Hierarchy

**GooglePayPaymentInitializeOptions**

## Index

### Properties

* [walletButton](googlepaypaymentinitializeoptions.md#walletbutton)

### Methods

* [onError](googlepaypaymentinitializeoptions.md#onerror)
* [onPaymentSelect](googlepaypaymentinitializeoptions.md#onpaymentselect)

---

## Properties

<a id="walletbutton"></a>

### `<Optional>` walletButton

**● walletButton**: * `undefined` &#124; `string`
*

This walletButton is used to set an event listener, provide an element ID if you want users to be able to launch the GooglePay wallet modal by clicking on a button. It should be an HTML element.

___

## Methods

<a id="onerror"></a>

### `<Optional>` onError

▸ **onError**(error: *`Error`*): `void`

A callback that gets called when GooglePay fails to initialize or selects a payment option.

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

