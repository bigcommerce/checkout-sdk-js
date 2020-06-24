[@bigcommerce/checkout-sdk](../README.md) › [KlarnaV2PaymentInitializeOptions](klarnav2paymentinitializeoptions.md)

# Interface: KlarnaV2PaymentInitializeOptions

A set of options that are required to initialize the KlarnaV2 payment method.

When KlarnaV2 is initialized, a list of payment options will be displayed for the customer to choose from.
Each one with its own widget.

## Hierarchy

* **KlarnaV2PaymentInitializeOptions**

## Index

### Properties

* [container](klarnav2paymentinitializeoptions.md#container)

### Methods

* [onLoad](klarnav2paymentinitializeoptions.md#optional-onload)

## Properties

###  container

• **container**: *string*

The ID of a container which the payment widget should insert into.

## Methods

### `Optional` onLoad

▸ **onLoad**(`response`: [KlarnaLoadResponse_2](klarnaloadresponse_2.md)): *void*

A callback that gets called when the widget is loaded and ready to be
interacted with.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`response` | [KlarnaLoadResponse_2](klarnaloadresponse_2.md) | The result of the initialization. It indicates whether or not the widget is loaded successfully.  |

**Returns:** *void*
