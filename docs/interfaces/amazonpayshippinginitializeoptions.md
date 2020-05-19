[@bigcommerce/checkout-sdk](../README.md) > [AmazonPayShippingInitializeOptions](../interfaces/amazonpayshippinginitializeoptions.md)

# AmazonPayShippingInitializeOptions

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

___

## Methods

<a id="onaddressselect"></a>

### `<Optional>` onAddressSelect

▸ **onAddressSelect**(reference: *[AmazonPayOrderReference](amazonpayorderreference.md)*): `void`

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reference | [AmazonPayOrderReference](amazonpayorderreference.md) |  The order reference provided by Amazon. |

**Returns:** `void`

___
<a id="onerror"></a>

### `<Optional>` onError

▸ **onError**(error: * [AmazonPayWidgetError](amazonpaywidgeterror.md) &#124; [StandardError](../classes/standarderror.md)*): `void`

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| error |  [AmazonPayWidgetError](amazonpaywidgeterror.md) &#124; [StandardError](../classes/standarderror.md)|  The error object describing the failure of the initialization. |

**Returns:** `void`

___
<a id="onready"></a>

### `<Optional>` onReady

▸ **onReady**(reference: *[AmazonPayOrderReference](amazonpayorderreference.md)*): `void`

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reference | [AmazonPayOrderReference](amazonpayorderreference.md) |  The order reference provided by Amazon. |

**Returns:** `void`

___

