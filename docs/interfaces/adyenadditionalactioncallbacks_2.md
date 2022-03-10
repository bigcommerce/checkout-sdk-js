[@bigcommerce/checkout-sdk](../README.md) › [AdyenAdditionalActionCallbacks_2](adyenadditionalactioncallbacks_2.md)

# Interface: AdyenAdditionalActionCallbacks_2

## Hierarchy

* **AdyenAdditionalActionCallbacks_2**

  ↳ [AdyenAdditionalActionOptions_2](adyenadditionalactionoptions_2.md)

## Index

### Methods

* [onBeforeLoad](adyenadditionalactioncallbacks_2.md#optional-onbeforeload)
* [onComplete](adyenadditionalactioncallbacks_2.md#optional-oncomplete)
* [onLoad](adyenadditionalactioncallbacks_2.md#optional-onload)

## Methods

### `Optional` onBeforeLoad

▸ **onBeforeLoad**(`shopperInteraction?`: undefined | false | true): *void*

A callback that gets called before adyen component is loaded

**Parameters:**

Name | Type |
------ | ------ |
`shopperInteraction?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

### `Optional` onComplete

▸ **onComplete**(): *void*

A callback that gets called when adyen component verification
is completed

**Returns:** *void*

___

### `Optional` onLoad

▸ **onLoad**(`cancel?`: undefined | function): *void*

A callback that gets called when adyen component is loaded

**Parameters:**

Name | Type |
------ | ------ |
`cancel?` | undefined &#124; function |

**Returns:** *void*
