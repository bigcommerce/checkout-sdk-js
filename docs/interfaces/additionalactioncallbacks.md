[@bigcommerce/checkout-sdk](../README.md) > [AdditionalActionCallbacks](../interfaces/additionalactioncallbacks.md)

# AdditionalActionCallbacks

## Hierarchy

**AdditionalActionCallbacks**

↳  [AdyenAdditionalActionOptions](adyenadditionalactionoptions.md)

↳  [AdyenThreeDS2Options](adyenthreeds2options.md)

## Index

### Methods

* [onBeforeLoad](additionalactioncallbacks.md#onbeforeload)
* [onComplete](additionalactioncallbacks.md#oncomplete)
* [onLoad](additionalactioncallbacks.md#onload)

---

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

