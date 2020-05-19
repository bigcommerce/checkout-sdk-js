[@bigcommerce/checkout-sdk](../README.md) > [AdyenAdditionalActionOptions](../interfaces/adyenadditionalactionoptions.md)

# AdyenAdditionalActionOptions

## Hierarchy

 [AdyenAdditionalActionCallbacks](adyenadditionalactioncallbacks.md)

**↳ AdyenAdditionalActionOptions**

## Index

### Properties

* [containerId](adyenadditionalactionoptions.md#containerid)

### Methods

* [onBeforeLoad](adyenadditionalactionoptions.md#onbeforeload)
* [onComplete](adyenadditionalactionoptions.md#oncomplete)
* [onLoad](adyenadditionalactionoptions.md#onload)

---

## Properties

<a id="containerid"></a>

###  containerId

**● containerId**: *`string`*

___

## Methods

<a id="onbeforeload"></a>

### `<Optional>` onBeforeLoad

▸ **onBeforeLoad**(shopperInteraction?: * `undefined` &#124; `false` &#124; `true`*): `void`

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Optional` shopperInteraction |  `undefined` &#124; `false` &#124; `true`|

**Returns:** `void`

___
<a id="oncomplete"></a>

### `<Optional>` onComplete

▸ **onComplete**(): `void`

**Returns:** `void`

___
<a id="onload"></a>

### `<Optional>` onLoad

▸ **onLoad**(cancel?: * `undefined` &#124; `function`*): `void`

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Optional` cancel |  `undefined` &#124; `function`|

**Returns:** `void`

___

