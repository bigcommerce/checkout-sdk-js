[@bigcommerce/checkout-sdk](../README.md) › [BlueSnapV2PaymentInitializeOptions](bluesnapv2paymentinitializeoptions.md)

# Interface: BlueSnapV2PaymentInitializeOptions

A set of options that are required to initialize the BlueSnap V2 payment
method.

The payment step is done through a web page via an iframe provided by the
strategy.

## Hierarchy

* **BlueSnapV2PaymentInitializeOptions**

## Index

### Properties

* [style](bluesnapv2paymentinitializeoptions.md#optional-style)

### Methods

* [onLoad](bluesnapv2paymentinitializeoptions.md#onload)

## Properties

### `Optional` style

• **style**? : *[BlueSnapV2StyleProps](bluesnapv2styleprops.md)*

A set of CSS properties to apply to the iframe.

## Methods

###  onLoad

▸ **onLoad**(`iframe`: HTMLIFrameElement, `cancel`: function): *void*

A callback that gets called when the iframe is ready to be added to the
current page. It is responsible for determining where the iframe should
be inserted in the DOM.

**Parameters:**

▪ **iframe**: *HTMLIFrameElement*

The iframe element containing the payment web page
provided by the strategy.

▪ **cancel**: *function*

A function, when called, will cancel the payment
process and remove the iframe.

▸ (): *void*

**Returns:** *void*
