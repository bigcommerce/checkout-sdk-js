[@bigcommerce/checkout-sdk](../README.md) > [AmazonPayCustomerInitializeOptions](../interfaces/amazonpaycustomerinitializeoptions.md)

# AmazonPayCustomerInitializeOptions

A set of options that are required to initialize the customer step of checkout to support Amazon Pay.

When AmazonPay is initialized, a sign-in button will be inserted into the DOM. When the customer clicks on it, they will be redirected to Amazon to sign in.

## Hierarchy

**AmazonPayCustomerInitializeOptions**

## Index

### Properties

* [color](amazonpaycustomerinitializeoptions.md#color)
* [container](amazonpaycustomerinitializeoptions.md#container)
* [size](amazonpaycustomerinitializeoptions.md#size)

### Methods

* [onError](amazonpaycustomerinitializeoptions.md#onerror)

---

## Properties

<a id="color"></a>

### `<Optional>` color

**● color**: * "Gold" &#124; "LightGray" &#124; "DarkGray"
*

The colour of the sign-in button.

___
<a id="container"></a>

###  container

**● container**: *`string`*

The ID of a container which the sign-in button should insert into.

___
<a id="size"></a>

### `<Optional>` size

**● size**: * "small" &#124; "medium" &#124; "large" &#124; "x-large"
*

The size of the sign-in button.

___

## Methods

<a id="onerror"></a>

### `<Optional>` onError

▸ **onError**(error: * [AmazonPayWidgetError](amazonpaywidgeterror.md) &#124; [StandardError](../classes/standarderror.md)*): `void`

A callback that gets called if unable to initialize the widget or select one of the address options provided by the widget.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| error |  [AmazonPayWidgetError](amazonpaywidgeterror.md) &#124; [StandardError](../classes/standarderror.md)|  The error object describing the failure. |

**Returns:** `void`

___

