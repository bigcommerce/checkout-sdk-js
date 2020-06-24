[@bigcommerce/checkout-sdk](../README.md) › [EmbeddedCheckoutOptions](embeddedcheckoutoptions.md)

# Interface: EmbeddedCheckoutOptions

## Hierarchy

* **EmbeddedCheckoutOptions**

## Index

### Properties

* [containerId](embeddedcheckoutoptions.md#containerid)
* [styles](embeddedcheckoutoptions.md#optional-styles)
* [url](embeddedcheckoutoptions.md#url)

### Methods

* [onComplete](embeddedcheckoutoptions.md#optional-oncomplete)
* [onError](embeddedcheckoutoptions.md#optional-onerror)
* [onFrameError](embeddedcheckoutoptions.md#optional-onframeerror)
* [onFrameLoad](embeddedcheckoutoptions.md#optional-onframeload)
* [onLoad](embeddedcheckoutoptions.md#optional-onload)
* [onSignOut](embeddedcheckoutoptions.md#optional-onsignout)

## Properties

###  containerId

• **containerId**: *string*

___

### `Optional` styles

• **styles**? : *[EmbeddedCheckoutStyles](embeddedcheckoutstyles.md)*

___

###  url

• **url**: *string*

## Methods

### `Optional` onComplete

▸ **onComplete**(`event`: [EmbeddedCheckoutCompleteEvent](embeddedcheckoutcompleteevent.md)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`event` | [EmbeddedCheckoutCompleteEvent](embeddedcheckoutcompleteevent.md) |

**Returns:** *void*

___

### `Optional` onError

▸ **onError**(`event`: [EmbeddedCheckoutErrorEvent](embeddedcheckouterrorevent.md)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`event` | [EmbeddedCheckoutErrorEvent](embeddedcheckouterrorevent.md) |

**Returns:** *void*

___

### `Optional` onFrameError

▸ **onFrameError**(`event`: [EmbeddedCheckoutFrameErrorEvent](embeddedcheckoutframeerrorevent.md)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`event` | [EmbeddedCheckoutFrameErrorEvent](embeddedcheckoutframeerrorevent.md) |

**Returns:** *void*

___

### `Optional` onFrameLoad

▸ **onFrameLoad**(`event`: [EmbeddedCheckoutFrameLoadedEvent](embeddedcheckoutframeloadedevent.md)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`event` | [EmbeddedCheckoutFrameLoadedEvent](embeddedcheckoutframeloadedevent.md) |

**Returns:** *void*

___

### `Optional` onLoad

▸ **onLoad**(`event`: [EmbeddedCheckoutLoadedEvent](embeddedcheckoutloadedevent.md)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`event` | [EmbeddedCheckoutLoadedEvent](embeddedcheckoutloadedevent.md) |

**Returns:** *void*

___

### `Optional` onSignOut

▸ **onSignOut**(`event`: [EmbeddedCheckoutSignedOutEvent](embeddedcheckoutsignedoutevent.md)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`event` | [EmbeddedCheckoutSignedOutEvent](embeddedcheckoutsignedoutevent.md) |

**Returns:** *void*
