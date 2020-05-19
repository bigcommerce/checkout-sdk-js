[@bigcommerce/checkout-sdk](../README.md) > [BlueSnapV2PaymentInitializeOptions](../interfaces/bluesnapv2paymentinitializeoptions.md)

# BlueSnapV2PaymentInitializeOptions

## Hierarchy

**BlueSnapV2PaymentInitializeOptions**

## Index

### Properties

* [style](bluesnapv2paymentinitializeoptions.md#style)

### Methods

* [onLoad](bluesnapv2paymentinitializeoptions.md#onload)

---

## Properties

<a id="style"></a>

### `<Optional>` style

**● style**: *[BlueSnapV2StyleProps](bluesnapv2styleprops.md)*

___

## Methods

<a id="onload"></a>

###  onLoad

▸ **onLoad**(iframe: *`HTMLIFrameElement`*, cancel: *`function`*): `void`

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| iframe | `HTMLIFrameElement` |  The iframe element containing the payment web page provided by the strategy. |
| cancel | `function` |  A function, when called, will cancel the payment process and remove the iframe. |

**Returns:** `void`

___

