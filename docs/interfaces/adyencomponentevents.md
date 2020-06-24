[@bigcommerce/checkout-sdk](../README.md) › [AdyenComponentEvents](adyencomponentevents.md)

# Interface: AdyenComponentEvents

## Hierarchy

* **AdyenComponentEvents**

  ↳ [AdyenCreditCardComponentOptions](adyencreditcardcomponentoptions.md)

## Index

### Methods

* [onChange](adyencomponentevents.md#optional-onchange)
* [onError](adyencomponentevents.md#optional-onerror)

## Methods

### `Optional` onChange

▸ **onChange**(`state`: [AdyenComponentState](../README.md#adyencomponentstate), `component`: [AdyenComponent](adyencomponent.md)): *void*

Called when the shopper enters data in the card input fields.
Here you have the option to override your main Adyen Checkout configuration.

**Parameters:**

Name | Type |
------ | ------ |
`state` | [AdyenComponentState](../README.md#adyencomponentstate) |
`component` | [AdyenComponent](adyencomponent.md) |

**Returns:** *void*

___

### `Optional` onError

▸ **onError**(`state`: [AdyenComponentState](../README.md#adyencomponentstate), `component`: [AdyenComponent](adyencomponent.md)): *void*

Called in case of an invalid card number, invalid expiry date, or
 incomplete field. Called again when errors are cleared.

**Parameters:**

Name | Type |
------ | ------ |
`state` | [AdyenComponentState](../README.md#adyencomponentstate) |
`component` | [AdyenComponent](adyencomponent.md) |

**Returns:** *void*
