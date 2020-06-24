[@bigcommerce/checkout-sdk](../README.md) › [KlarnaPaymentInitializeOptions](klarnapaymentinitializeoptions.md)

# Interface: KlarnaPaymentInitializeOptions

A set of options that are required to initialize the Klarna payment method.

When Klarna is initialized, a widget will be inserted into the DOM. The
widget has a list of payment options for the customer to choose from.

## Hierarchy

* **KlarnaPaymentInitializeOptions**

## Index

### Properties

* [container](klarnapaymentinitializeoptions.md#container)

### Methods

* [onLoad](klarnapaymentinitializeoptions.md#optional-onload)

## Properties

###  container

• **container**: *string*

The ID of a container which the payment widget should insert into.

## Methods

### `Optional` onLoad

▸ **onLoad**(`response`: [KlarnaLoadResponse](klarnaloadresponse.md)): *void*

A callback that gets called when the widget is loaded and ready to be
interacted with.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`response` | [KlarnaLoadResponse](klarnaloadresponse.md) | The result of the initialization. It indicates whether or not the widget is loaded successfully.  |

**Returns:** *void*
