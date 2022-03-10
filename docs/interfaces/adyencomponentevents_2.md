[@bigcommerce/checkout-sdk](../README.md) › [AdyenComponentEvents_2](adyencomponentevents_2.md)

# Interface: AdyenComponentEvents_2

## Hierarchy

* **AdyenComponentEvents_2**

  ↳ [AdyenV3CreditCardComponentOptions](adyenv3creditcardcomponentoptions.md)

## Index

### Methods

* [onChange](adyencomponentevents_2.md#optional-onchange)
* [onError](adyencomponentevents_2.md#optional-onerror)
* [onFieldValid](adyencomponentevents_2.md#optional-onfieldvalid)

## Methods

### `Optional` onChange

▸ **onChange**(`state`: [AdyenV3ComponentState](../README.md#adyenv3componentstate), `component`: [AdyenComponent_2](adyencomponent_2.md)): *void*

Called when the shopper enters data in the card input fields.
Here you have the option to override your main Adyen Checkout configuration.

**Parameters:**

Name | Type |
------ | ------ |
`state` | [AdyenV3ComponentState](../README.md#adyenv3componentstate) |
`component` | [AdyenComponent_2](adyencomponent_2.md) |

**Returns:** *void*

___

### `Optional` onError

▸ **onError**(`state`: [AdyenV3ComponentState](../README.md#adyenv3componentstate), `component`: [AdyenComponent_2](adyencomponent_2.md)): *void*

Called in case of an invalid card number, invalid expiry date, or
 incomplete field. Called again when errors are cleared.

**Parameters:**

Name | Type |
------ | ------ |
`state` | [AdyenV3ComponentState](../README.md#adyenv3componentstate) |
`component` | [AdyenComponent_2](adyencomponent_2.md) |

**Returns:** *void*

___

### `Optional` onFieldValid

▸ **onFieldValid**(`state`: [AdyenV3ComponentState](../README.md#adyenv3componentstate), `component`: [AdyenComponent_2](adyencomponent_2.md)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`state` | [AdyenV3ComponentState](../README.md#adyenv3componentstate) |
`component` | [AdyenComponent_2](adyencomponent_2.md) |

**Returns:** *void*
