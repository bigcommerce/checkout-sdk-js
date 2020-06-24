[@bigcommerce/checkout-sdk](../README.md) › [AmazonPayPaymentInitializeOptions](amazonpaypaymentinitializeoptions.md)

# Interface: AmazonPayPaymentInitializeOptions

A set of options that are required to initialize the Amazon Pay payment
method.

When AmazonPay is initialized, a widget will be inserted into the DOM. The
widget has a list of payment options for the customer to choose from.

## Hierarchy

* **AmazonPayPaymentInitializeOptions**

## Index

### Properties

* [container](amazonpaypaymentinitializeoptions.md#container)

### Methods

* [onError](amazonpaypaymentinitializeoptions.md#optional-onerror)
* [onPaymentSelect](amazonpaypaymentinitializeoptions.md#optional-onpaymentselect)
* [onReady](amazonpaypaymentinitializeoptions.md#optional-onready)

## Properties

###  container

• **container**: *string*

The ID of a container which the payment widget should insert into.

## Methods

### `Optional` onError

▸ **onError**(`error`: [AmazonPayWidgetError](amazonpaywidgeterror.md) | [StandardError](../classes/standarderror.md)): *void*

A callback that gets called if unable to initialize the widget or select
one of the payment options.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`error` | [AmazonPayWidgetError](amazonpaywidgeterror.md) &#124; [StandardError](../classes/standarderror.md) | The error object describing the failure.  |

**Returns:** *void*

___

### `Optional` onPaymentSelect

▸ **onPaymentSelect**(`reference`: [AmazonPayOrderReference](amazonpayorderreference.md)): *void*

A callback that gets called when the customer selects one of the payment
options provided by the widget.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`reference` | [AmazonPayOrderReference](amazonpayorderreference.md) | The order reference provided by Amazon.  |

**Returns:** *void*

___

### `Optional` onReady

▸ **onReady**(`reference`: [AmazonPayOrderReference](amazonpayorderreference.md)): *void*

A callback that gets called when the widget is loaded and ready to be
interacted with.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`reference` | [AmazonPayOrderReference](amazonpayorderreference.md) | The order reference provided by Amazon.  |

**Returns:** *void*
