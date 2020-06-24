[@bigcommerce/checkout-sdk](../README.md) › [BraintreeThreeDSecureOptions](braintreethreedsecureoptions.md)

# Interface: BraintreeThreeDSecureOptions

A set of options that are required to support 3D Secure authentication flow.

If the customer uses a credit card that has 3D Secure enabled, they will be
asked to verify their identity when they pay. The verification is done
through a web page via an iframe provided by the card issuer.

## Hierarchy

* **BraintreeThreeDSecureOptions**

## Index

### Methods

* [addFrame](braintreethreedsecureoptions.md#addframe)
* [removeFrame](braintreethreedsecureoptions.md#removeframe)

## Methods

###  addFrame

▸ **addFrame**(`error`: [Error](amazonpaywidgeterror.md#error) | undefined, `iframe`: HTMLIFrameElement, `cancel`: function): *void*

A callback that gets called when the iframe is ready to be added to the
current page. It is responsible for determining where the iframe should
be inserted in the DOM.

**Parameters:**

▪ **error**: *[Error](amazonpaywidgeterror.md#error) | undefined*

Any error raised during the verification process;
undefined if there is none.

▪ **iframe**: *HTMLIFrameElement*

The iframe element containing the verification web page
provided by the card issuer.

▪ **cancel**: *function*

A function, when called, will cancel the verification
process and remove the iframe.

▸ (): *Promise‹[BraintreeVerifyPayload](braintreeverifypayload.md)› | undefined*

**Returns:** *void*

___

###  removeFrame

▸ **removeFrame**(): *void*

A callback that gets called when the iframe is about to be removed from
the current page.

**Returns:** *void*
