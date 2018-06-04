[@bigcommerce/checkout-sdk](../README.md) > [AmazonPayPaymentInitializeOptions](../interfaces/amazonpaypaymentinitializeoptions.md)

# AmazonPayPaymentInitializeOptions

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

___

## Methods

<a id="onerror"></a>

### `<Optional>` onError

▸ **onError**(error: * [AmazonPayWidgetError](amazonpaywidgeterror.md) &#124; [StandardError](../classes/standarderror.md)*): `void`

**Parameters:**

| Param | Type |
| ------ | ------ |
| error |  [AmazonPayWidgetError](amazonpaywidgeterror.md) &#124; [StandardError](../classes/standarderror.md)|

**Returns:** `void`

___
<a id="onpaymentselect"></a>

### `<Optional>` onPaymentSelect

▸ **onPaymentSelect**(reference: *[AmazonPayOrderReference](amazonpayorderreference.md)*): `void`

**Parameters:**

| Param | Type |
| ------ | ------ |
| reference | [AmazonPayOrderReference](amazonpayorderreference.md) |

**Returns:** `void`

___
<a id="onready"></a>

### `<Optional>` onReady

▸ **onReady**(reference: *[AmazonPayOrderReference](amazonpayorderreference.md)*): `void`

**Parameters:**

| Param | Type |
| ------ | ------ |
| reference | [AmazonPayOrderReference](amazonpayorderreference.md) |

**Returns:** `void`

___

