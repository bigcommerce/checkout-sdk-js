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

The location to insert the additional action component.

___

## Methods

<a id="onbeforeload"></a>

### `<Optional>` onBeforeLoad

▸ **onBeforeLoad**(shopperInteraction?: * `undefined` &#124; `false` &#124; `true`*): `void`

A callback that gets called before adyen component is loaded

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Optional` shopperInteraction |  `undefined` &#124; `false` &#124; `true`|

**Returns:** `void`

___
<a id="oncomplete"></a>

### `<Optional>` onComplete

▸ **onComplete**(): `void`

A callback that gets called when adyen component verification is completed

**Returns:** `void`

___
<a id="onload"></a>

### `<Optional>` onLoad

▸ **onLoad**(cancel?: * `undefined` &#124; `function`*): `void`

A callback that gets called when adyen component is loaded

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Optional` cancel |  `undefined` &#124; `function`|

**Returns:** `void`

___

