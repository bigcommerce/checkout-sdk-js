[@bigcommerce/checkout-sdk](../README.md) > [AdyenComponentEvents](../interfaces/adyencomponentevents.md)

# AdyenComponentEvents

## Hierarchy

**AdyenComponentEvents**

↳  [AdyenCreditCardComponentOptions](adyencreditcardcomponentoptions.md)

## Index

### Methods

* [onChange](adyencomponentevents.md#onchange)
* [onError](adyencomponentevents.md#onerror)

---

## Methods

<a id="onchange"></a>

### `<Optional>` onChange

▸ **onChange**(state: *[AdyenComponentState](../#adyencomponentstate)*, component: *[AdyenComponent](adyencomponent.md)*): `void`

Called when the shopper enters data in the card input fields. Here you have the option to override your main Adyen Checkout configuration.

**Parameters:**

| Param | Type |
| ------ | ------ |
| state | [AdyenComponentState](../#adyencomponentstate) |
| component | [AdyenComponent](adyencomponent.md) |

**Returns:** `void`

___
<a id="onerror"></a>

### `<Optional>` onError

▸ **onError**(state: *[AdyenComponentState](../#adyencomponentstate)*, component: *[AdyenComponent](adyencomponent.md)*): `void`

Called in case of an invalid card number, invalid expiry date, or incomplete field. Called again when errors are cleared.

**Parameters:**

| Param | Type |
| ------ | ------ |
| state | [AdyenComponentState](../#adyencomponentstate) |
| component | [AdyenComponent](adyencomponent.md) |

**Returns:** `void`

___

