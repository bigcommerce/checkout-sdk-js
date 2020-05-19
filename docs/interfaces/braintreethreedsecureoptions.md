[@bigcommerce/checkout-sdk](../README.md) > [BraintreeThreeDSecureOptions](../interfaces/braintreethreedsecureoptions.md)

# BraintreeThreeDSecureOptions

## Hierarchy

**BraintreeThreeDSecureOptions**

## Index

### Methods

* [addFrame](braintreethreedsecureoptions.md#addframe)
* [removeFrame](braintreethreedsecureoptions.md#removeframe)

---

## Methods

<a id="addframe"></a>

###  addFrame

▸ **addFrame**(error: * `Error` &#124; `undefined`*, iframe: *`HTMLIFrameElement`*, cancel: *`function`*): `void`

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| error |  `Error` &#124; `undefined`|  Any error raised during the verification process; undefined if there is none. |
| iframe | `HTMLIFrameElement` |  The iframe element containing the verification web page provided by the card issuer. |
| cancel | `function` |  A function, when called, will cancel the verification process and remove the iframe. |

**Returns:** `void`

___
<a id="removeframe"></a>

###  removeFrame

▸ **removeFrame**(): `void`

**Returns:** `void`

___

