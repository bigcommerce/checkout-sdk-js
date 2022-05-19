[@bigcommerce/checkout-sdk](../README.md) › [WorldpayPaymentInitializeOptions](worldpaypaymentinitializeoptions.md)

# Interface: WorldpayPaymentInitializeOptions

## Hierarchy

* **WorldpayPaymentInitializeOptions**

## Index

### Methods

* [onLoad](worldpaypaymentinitializeoptions.md#onload)

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
