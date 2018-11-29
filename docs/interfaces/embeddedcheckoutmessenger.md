[@bigcommerce/checkout-sdk](../README.md) > [EmbeddedCheckoutMessenger](../interfaces/embeddedcheckoutmessenger.md)

# EmbeddedCheckoutMessenger

## Hierarchy

**EmbeddedCheckoutMessenger**

## Index

### Methods

* [postComplete](embeddedcheckoutmessenger.md#postcomplete)
* [postError](embeddedcheckoutmessenger.md#posterror)
* [postFrameError](embeddedcheckoutmessenger.md#postframeerror)
* [postFrameLoaded](embeddedcheckoutmessenger.md#postframeloaded)
* [postLoaded](embeddedcheckoutmessenger.md#postloaded)
* [postSignedOut](embeddedcheckoutmessenger.md#postsignedout)
* [receiveStyles](embeddedcheckoutmessenger.md#receivestyles)

---

## Methods

<a id="postcomplete"></a>

###  postComplete

▸ **postComplete**(): `void`

**Returns:** `void`

___
<a id="posterror"></a>

###  postError

▸ **postError**(payload: * `Error` &#124; [CustomError](customerror.md)*): `void`

**Parameters:**

| Param | Type |
| ------ | ------ |
| payload |  `Error` &#124; [CustomError](customerror.md)|

**Returns:** `void`

___
<a id="postframeerror"></a>

###  postFrameError

▸ **postFrameError**(payload: * `Error` &#124; [CustomError](customerror.md)*): `void`

**Parameters:**

| Param | Type |
| ------ | ------ |
| payload |  `Error` &#124; [CustomError](customerror.md)|

**Returns:** `void`

___
<a id="postframeloaded"></a>

###  postFrameLoaded

▸ **postFrameLoaded**(payload?: *[EmbeddedContentOptions](embeddedcontentoptions.md)*): `void`

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Optional` payload | [EmbeddedContentOptions](embeddedcontentoptions.md) |

**Returns:** `void`

___
<a id="postloaded"></a>

###  postLoaded

▸ **postLoaded**(): `void`

**Returns:** `void`

___
<a id="postsignedout"></a>

###  postSignedOut

▸ **postSignedOut**(): `void`

**Returns:** `void`

___
<a id="receivestyles"></a>

###  receiveStyles

▸ **receiveStyles**(handler: *`function`*): `void`

**Parameters:**

| Param | Type |
| ------ | ------ |
| handler | `function` |

**Returns:** `void`

___

