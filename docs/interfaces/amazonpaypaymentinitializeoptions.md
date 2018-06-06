[@bigcommerce/checkout-sdk](../README.md) > [AmazonPayPaymentInitializeOptions](../interfaces/amazonpaypaymentinitializeoptions.md)

# AmazonPayPaymentInitializeOptions

A set of options that are required to initialize the Amazon Pay payment method.

When AmazonPay is initialized, a widget will be inserted into the DOM. The widget has a list of payment options for the customer to choose from.

## Hierarchy

**AmazonPayPaymentInitializeOptions**

## Index

### Properties

* [container](amazonpaypaymentinitializeoptions.md#container)

### Methods

* [onError](amazonpaypaymentinitializeoptions.md#onerror)
* [onPaymentSelect](amazonpaypaymentinitializeoptions.md#onpaymentselect)
* [onReady](amazonpaypaymentinitializeoptions.md#onready)

---

## Properties

<a id="container"></a>

###  container

**● container**: *`string`*

The ID of a container which the payment widget should insert into.

___

## Methods

<a id="onerror"></a>

### `<Optional>` onError

▸ **onError**(error: * [AmazonPayWidgetError](amazonpaywidgeterror.md) &#124; [StandardError](../classes/standarderror.md)*): `void`

A callback that gets called if unable to initialize the widget or select one of the payment options.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| error |  [AmazonPayWidgetError](amazonpaywidgeterror.md) &#124; [StandardError](../classes/standarderror.md)|  The error object describing the failure. |

**Returns:** `void`

___
<a id="onpaymentselect"></a>

### `<Optional>` onPaymentSelect

▸ **onPaymentSelect**(reference: *[AmazonPayOrderReference](amazonpayorderreference.md)*): `void`

A callback that gets called when the customer selects one of the payment options provided by the widget.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reference | [AmazonPayOrderReference](amazonpayorderreference.md) |  The order reference provided by Amazon. |

**Returns:** `void`

___
<a id="onready"></a>

### `<Optional>` onReady

▸ **onReady**(reference: *[AmazonPayOrderReference](amazonpayorderreference.md)*): `void`

A callback that gets called when the widget is loaded and ready to be interacted with.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reference | [AmazonPayOrderReference](amazonpayorderreference.md) |  The order reference provided by Amazon. |

**Returns:** `void`

___

