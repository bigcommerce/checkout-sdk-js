[@bigcommerce/checkout-sdk](../README.md) > [KlarnaV2PaymentInitializeOptions](../interfaces/klarnav2paymentinitializeoptions.md)

# KlarnaV2PaymentInitializeOptions

A set of options that are required to initialize the KlarnaV2 payment method.

When KlarnaV2 is initialized, a list of payment options will be displayed for the customer to choose from. Each one with its own widget.

## Hierarchy

**KlarnaV2PaymentInitializeOptions**

## Index

### Properties

* [container](klarnav2paymentinitializeoptions.md#container)

### Methods

* [onLoad](klarnav2paymentinitializeoptions.md#onload)

---

## Properties

<a id="container"></a>

###  container

**● container**: *`string`*

The ID of a container which the payment widget should insert into.

___

## Methods

<a id="onload"></a>

### `<Optional>` onLoad

▸ **onLoad**(response: *[KlarnaLoadResponse_2](klarnaloadresponse_2.md)*): `void`

A callback that gets called when the widget is loaded and ready to be interacted with.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| response | [KlarnaLoadResponse_2](klarnaloadresponse_2.md) |  The result of the initialization. It indicates whether or not the widget is loaded successfully. |

**Returns:** `void`

___

