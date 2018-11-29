[@bigcommerce/checkout-sdk](../README.md) > [EmbeddedCheckoutOptions](../interfaces/embeddedcheckoutoptions.md)

# EmbeddedCheckoutOptions

## Hierarchy

**EmbeddedCheckoutOptions**

## Index

### Properties

* [containerId](embeddedcheckoutoptions.md#containerid)
* [styles](embeddedcheckoutoptions.md#styles)
* [url](embeddedcheckoutoptions.md#url)

### Methods

* [onComplete](embeddedcheckoutoptions.md#oncomplete)
* [onError](embeddedcheckoutoptions.md#onerror)
* [onFrameError](embeddedcheckoutoptions.md#onframeerror)
* [onFrameLoad](embeddedcheckoutoptions.md#onframeload)
* [onLoad](embeddedcheckoutoptions.md#onload)
* [onSignOut](embeddedcheckoutoptions.md#onsignout)

---

## Properties

<a id="containerid"></a>

###  containerId

**● containerId**: *`string`*

___
<a id="styles"></a>

### `<Optional>` styles

**● styles**: *[EmbeddedCheckoutStyles](embeddedcheckoutstyles.md)*

___
<a id="url"></a>

###  url

**● url**: *`string`*

___

## Methods

<a id="oncomplete"></a>

### `<Optional>` onComplete

▸ **onComplete**(event: *[EmbeddedCheckoutCompleteEvent](embeddedcheckoutcompleteevent.md)*): `void`

**Parameters:**

| Param | Type |
| ------ | ------ |
| event | [EmbeddedCheckoutCompleteEvent](embeddedcheckoutcompleteevent.md) |

**Returns:** `void`

___
<a id="onerror"></a>

### `<Optional>` onError

▸ **onError**(event: *[EmbeddedCheckoutErrorEvent](embeddedcheckouterrorevent.md)*): `void`

**Parameters:**

| Param | Type |
| ------ | ------ |
| event | [EmbeddedCheckoutErrorEvent](embeddedcheckouterrorevent.md) |

**Returns:** `void`

___
<a id="onframeerror"></a>

### `<Optional>` onFrameError

▸ **onFrameError**(event: *[EmbeddedCheckoutFrameErrorEvent](embeddedcheckoutframeerrorevent.md)*): `void`

**Parameters:**

| Param | Type |
| ------ | ------ |
| event | [EmbeddedCheckoutFrameErrorEvent](embeddedcheckoutframeerrorevent.md) |

**Returns:** `void`

___
<a id="onframeload"></a>

### `<Optional>` onFrameLoad

▸ **onFrameLoad**(event: *[EmbeddedCheckoutFrameLoadedEvent](embeddedcheckoutframeloadedevent.md)*): `void`

**Parameters:**

| Param | Type |
| ------ | ------ |
| event | [EmbeddedCheckoutFrameLoadedEvent](embeddedcheckoutframeloadedevent.md) |

**Returns:** `void`

___
<a id="onload"></a>

### `<Optional>` onLoad

▸ **onLoad**(event: *[EmbeddedCheckoutLoadedEvent](embeddedcheckoutloadedevent.md)*): `void`

**Parameters:**

| Param | Type |
| ------ | ------ |
| event | [EmbeddedCheckoutLoadedEvent](embeddedcheckoutloadedevent.md) |

**Returns:** `void`

___
<a id="onsignout"></a>

### `<Optional>` onSignOut

▸ **onSignOut**(event: *[EmbeddedCheckoutSignedOutEvent](embeddedcheckoutsignedoutevent.md)*): `void`

**Parameters:**

| Param | Type |
| ------ | ------ |
| event | [EmbeddedCheckoutSignedOutEvent](embeddedcheckoutsignedoutevent.md) |

**Returns:** `void`

___

