[@bigcommerce/checkout-sdk](../README.md) › [AmazonPayCustomerInitializeOptions](amazonpaycustomerinitializeoptions.md)

# Interface: AmazonPayCustomerInitializeOptions

A set of options that are required to initialize the customer step of
checkout to support Amazon Pay.

When AmazonPay is initialized, a sign-in button will be inserted into the
DOM. When the customer clicks on it, they will be redirected to Amazon to
sign in.

## Hierarchy

* **AmazonPayCustomerInitializeOptions**

## Index

### Properties

* [color](amazonpaycustomerinitializeoptions.md#optional-color)
* [container](amazonpaycustomerinitializeoptions.md#container)
* [size](amazonpaycustomerinitializeoptions.md#optional-size)

### Methods

* [onError](amazonpaycustomerinitializeoptions.md#optional-onerror)

## Properties

### `Optional` color

• **color**? : *"Gold" | "LightGray" | "DarkGray"*

The colour of the sign-in button.

___

###  container

• **container**: *string*

The ID of a container which the sign-in button should insert into.

___

### `Optional` size

• **size**? : *"small" | "medium" | "large" | "x-large"*

The size of the sign-in button.

## Methods

### `Optional` onError

▸ **onError**(`error`: [AmazonPayWidgetError](amazonpaywidgeterror.md) | [StandardError](../classes/standarderror.md)): *void*

A callback that gets called if unable to initialize the widget or select
one of the address options provided by the widget.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`error` | [AmazonPayWidgetError](amazonpaywidgeterror.md) &#124; [StandardError](../classes/standarderror.md) | The error object describing the failure.  |

**Returns:** *void*
