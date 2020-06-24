[@bigcommerce/checkout-sdk](../README.md) › [EmbeddedCheckoutMessenger](embeddedcheckoutmessenger.md)

# Interface: EmbeddedCheckoutMessenger

## Hierarchy

* **EmbeddedCheckoutMessenger**

## Index

### Methods

* [postComplete](embeddedcheckoutmessenger.md#postcomplete)
* [postError](embeddedcheckoutmessenger.md#posterror)
* [postFrameError](embeddedcheckoutmessenger.md#postframeerror)
* [postFrameLoaded](embeddedcheckoutmessenger.md#postframeloaded)
* [postLoaded](embeddedcheckoutmessenger.md#postloaded)
* [postSignedOut](embeddedcheckoutmessenger.md#postsignedout)
* [receiveStyles](embeddedcheckoutmessenger.md#receivestyles)

## Methods

###  postComplete

▸ **postComplete**(): *void*

**Returns:** *void*

___

###  postError

▸ **postError**(`payload`: [Error](amazonpaywidgeterror.md#error) | [CustomError](customerror.md)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`payload` | [Error](amazonpaywidgeterror.md#error) &#124; [CustomError](customerror.md) |

**Returns:** *void*

___

###  postFrameError

▸ **postFrameError**(`payload`: [Error](amazonpaywidgeterror.md#error) | [CustomError](customerror.md)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`payload` | [Error](amazonpaywidgeterror.md#error) &#124; [CustomError](customerror.md) |

**Returns:** *void*

___

###  postFrameLoaded

▸ **postFrameLoaded**(`payload?`: [EmbeddedContentOptions](embeddedcontentoptions.md)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`payload?` | [EmbeddedContentOptions](embeddedcontentoptions.md) |

**Returns:** *void*

___

###  postLoaded

▸ **postLoaded**(): *void*

**Returns:** *void*

___

###  postSignedOut

▸ **postSignedOut**(): *void*

**Returns:** *void*

___

###  receiveStyles

▸ **receiveStyles**(`handler`: function): *void*

**Parameters:**

▪ **handler**: *function*

▸ (`styles`: [EmbeddedCheckoutStyles](embeddedcheckoutstyles.md)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`styles` | [EmbeddedCheckoutStyles](embeddedcheckoutstyles.md) |

**Returns:** *void*
