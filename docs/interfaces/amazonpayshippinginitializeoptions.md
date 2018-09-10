[@bigcommerce/checkout-sdk](../README.md) > [AmazonPayShippingInitializeOptions](../interfaces/amazonpayshippinginitializeoptions.md)

# AmazonPayShippingInitializeOptions

A set of options that are required to initialize the shipping step of checkout in order to support Amazon Pay.

When Amazon Pay is initialized, a widget will be inserted into the DOM. The widget has a list of shipping addresses for the customer to choose from.

## Hierarchy

**AmazonPayShippingInitializeOptions**

## Index

### Properties

* [container](amazonpayshippinginitializeoptions.md#container)

### Methods

* [onAddressSelect](amazonpayshippinginitializeoptions.md#onaddressselect)
* [onError](amazonpayshippinginitializeoptions.md#onerror)
* [onReady](amazonpayshippinginitializeoptions.md#onready)

---

## Properties

<a id="container"></a>

###  container

**● container**: *`string`*

The ID of a container which the address widget should insert into.

___

## Methods

<a id="onaddressselect"></a>

### `<Optional>` onAddressSelect

▸ **onAddressSelect**(reference: *[AmazonPayOrderReference](amazonpayorderreference.md)*): `void`

A callback that gets called when the customer selects an address option.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reference | [AmazonPayOrderReference](amazonpayorderreference.md) |  The order reference provided by Amazon. |

**Returns:** `void`

___
<a id="onerror"></a>

### `<Optional>` onError

▸ **onError**(error: * [AmazonPayWidgetError](amazonpaywidgeterror.md) &#124; [StandardError](../classes/standarderror.md)*): `void`

A callback that gets called if unable to initialize the widget or select one of the address options provided by the widget.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| error |  [AmazonPayWidgetError](amazonpaywidgeterror.md) &#124; [StandardError](../classes/standarderror.md)|  The error object describing the failure of the initialization. |

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

