[@bigcommerce/checkout-sdk](../README.md) > [AmazonPayShippingInitializeOptions](../interfaces/amazonpayshippinginitializeoptions.md)

# Interface: AmazonPayShippingInitializeOptions

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

| Param | Type |
| ------ | ------ |
| reference | [AmazonPayOrderReference](amazonpayorderreference.md) | 

**Returns:** `void`

___
<a id="onerror"></a>

### `<Optional>` onError

▸ **onError**(error: *[AmazonPayWidgetError](amazonpaywidgeterror.md) |[StandardError](../classes/standarderror.md)*): `void`

**Parameters:**

| Param | Type |
| ------ | ------ |
| error | [AmazonPayWidgetError](amazonpaywidgeterror.md) |
[StandardError](../classes/standarderror.md)
 | 

**Returns:** `void`

___
<a id="onready"></a>

### `<Optional>` onReady

▸ **onReady**(): `void`

**Returns:** `void`

___

