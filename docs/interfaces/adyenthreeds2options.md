[@bigcommerce/checkout-sdk](../README.md) › [AdyenThreeDS2Options](adyenthreeds2options.md)

# Interface: AdyenThreeDS2Options

## Hierarchy

* [AdyenAdditionalActionCallbacks](adyenadditionalactioncallbacks.md)

  ↳ **AdyenThreeDS2Options**

## Index

### Properties

* [widgetSize](adyenthreeds2options.md#optional-widgetsize)

### Methods

* [onBeforeLoad](adyenthreeds2options.md#optional-onbeforeload)
* [onComplete](adyenthreeds2options.md#optional-oncomplete)
* [onLoad](adyenthreeds2options.md#optional-onload)

## Properties

### `Optional` widgetSize

• **widgetSize**? : *undefined | string*

Specify Three3DS2Challenge Widget Size

Values
'01' = 250px x 400px
'02' = 390px x 400px
'03' = 500px x 600px
'04' = 600px x 400px
'05' = 100% x 100%

## Methods

### `Optional` onBeforeLoad

▸ **onBeforeLoad**(`shopperInteraction?`: undefined | false | true): *void*

*Inherited from [AdyenAdditionalActionCallbacks](adyenadditionalactioncallbacks.md).[onBeforeLoad](adyenadditionalactioncallbacks.md#optional-onbeforeload)*

A callback that gets called before adyen component is loaded

**Parameters:**

Name | Type |
------ | ------ |
`shopperInteraction?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

### `Optional` onComplete

▸ **onComplete**(): *void*

*Inherited from [AdyenAdditionalActionCallbacks](adyenadditionalactioncallbacks.md).[onComplete](adyenadditionalactioncallbacks.md#optional-oncomplete)*

A callback that gets called when adyen component verification
is completed

**Returns:** *void*

___

### `Optional` onLoad

▸ **onLoad**(`cancel?`: undefined | function): *void*

*Inherited from [AdyenAdditionalActionCallbacks](adyenadditionalactioncallbacks.md).[onLoad](adyenadditionalactioncallbacks.md#optional-onload)*

A callback that gets called when adyen component is loaded

**Parameters:**

Name | Type |
------ | ------ |
`cancel?` | undefined &#124; function |

**Returns:** *void*
