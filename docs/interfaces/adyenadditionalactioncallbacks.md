[@bigcommerce/checkout-sdk](../README.md) › [AdyenAdditionalActionCallbacks](adyenadditionalactioncallbacks.md)

# Interface: AdyenAdditionalActionCallbacks

## Hierarchy

* **AdyenAdditionalActionCallbacks**

  ↳ [AdyenAdditionalActionOptions](adyenadditionalactionoptions.md)

  ↳ [AdyenThreeDS2Options](adyenthreeds2options.md)

## Index

### Methods

* [onBeforeLoad](adyenadditionalactioncallbacks.md#optional-onbeforeload)
* [onComplete](adyenadditionalactioncallbacks.md#optional-oncomplete)
* [onLoad](adyenadditionalactioncallbacks.md#optional-onload)

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
