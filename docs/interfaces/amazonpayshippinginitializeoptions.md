[@bigcommerce/checkout-sdk](../README.md) › [AmazonPayShippingInitializeOptions](amazonpayshippinginitializeoptions.md)

# Interface: AmazonPayShippingInitializeOptions

A set of options that are required to initialize the shipping step of
checkout in order to support Amazon Pay.

When Amazon Pay is initialized, a widget will be inserted into the DOM. The
widget has a list of shipping addresses for the customer to choose from.

## Hierarchy

* **AmazonPayShippingInitializeOptions**

## Index

### Properties

* [container](amazonpayshippinginitializeoptions.md#container)

### Methods

* [onAddressSelect](amazonpayshippinginitializeoptions.md#optional-onaddressselect)
* [onError](amazonpayshippinginitializeoptions.md#optional-onerror)
* [onReady](amazonpayshippinginitializeoptions.md#optional-onready)

## Properties

###  container

• **container**: *string*

The ID of a container which the address widget should insert into.

## Methods

### `Optional` onAddressSelect

▸ **onAddressSelect**(`reference`: [AmazonPayOrderReference](amazonpayorderreference.md)): *void*

A callback that gets called when the customer selects an address option.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`reference` | [AmazonPayOrderReference](amazonpayorderreference.md) | The order reference provided by Amazon.  |

**Returns:** *void*

___

### `Optional` onError

▸ **onError**(`error`: [AmazonPayWidgetError](amazonpaywidgeterror.md) | [StandardError](../classes/standarderror.md)): *void*

A callback that gets called if unable to initialize the widget or select
one of the address options provided by the widget.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`error` | [AmazonPayWidgetError](amazonpaywidgeterror.md) &#124; [StandardError](../classes/standarderror.md) | The error object describing the failure of the initialization.  |

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
