[@bigcommerce/checkout-sdk](../README.md) > [AdyenCreditCardComponentOptions](../interfaces/adyencreditcardcomponentoptions.md)

# AdyenCreditCardComponentOptions

## Hierarchy

 [AdyenBaseCardComponentOptions](adyenbasecardcomponentoptions.md)

 [AdyenComponentEvents](adyencomponentevents.md)

**↳ AdyenCreditCardComponentOptions**

## Index

### Properties

* [brands](adyencreditcardcomponentoptions.md#brands)
* [details](adyencreditcardcomponentoptions.md#details)
* [enableStoreDetails](adyencreditcardcomponentoptions.md#enablestoredetails)
* [groupTypes](adyencreditcardcomponentoptions.md#grouptypes)
* [hasHolderName](adyencreditcardcomponentoptions.md#hasholdername)
* [holderName](adyencreditcardcomponentoptions.md#holdername)
* [holderNameRequired](adyencreditcardcomponentoptions.md#holdernamerequired)
* [placeholders](adyencreditcardcomponentoptions.md#placeholders)
* [styles](adyencreditcardcomponentoptions.md#styles)

### Methods

* [onChange](adyencreditcardcomponentoptions.md#onchange)
* [onError](adyencreditcardcomponentoptions.md#onerror)

---

## Properties

<a id="brands"></a>

### `<Optional>` brands

**● brands**: *`string`[]*

___
<a id="details"></a>

### `<Optional>` details

**● details**: *[InputDetail](inputdetail.md)[]*

___
<a id="enablestoredetails"></a>

### `<Optional>` enableStoreDetails

**● enableStoreDetails**: * `undefined` &#124; `false` &#124; `true`
*

___
<a id="grouptypes"></a>

### `<Optional>` groupTypes

**● groupTypes**: *`string`[]*

___
<a id="hasholdername"></a>

### `<Optional>` hasHolderName

**● hasHolderName**: * `undefined` &#124; `false` &#124; `true`
*

___
<a id="holdername"></a>

### `<Optional>` holderName

**● holderName**: * `undefined` &#124; `string`
*

___
<a id="holdernamerequired"></a>

### `<Optional>` holderNameRequired

**● holderNameRequired**: * `undefined` &#124; `false` &#124; `true`
*

___
<a id="placeholders"></a>

### `<Optional>` placeholders

**● placeholders**: * [CreditCardPlaceHolder](creditcardplaceholder.md) &#124; [SepaPlaceHolder](sepaplaceholder.md)
*

___
<a id="styles"></a>

### `<Optional>` styles

**● styles**: *[StyleOptions](styleoptions.md)*

___

## Methods

<a id="onchange"></a>

### `<Optional>` onChange

▸ **onChange**(state: *[AdyenComponentState](../#adyencomponentstate)*, component: *[AdyenComponent](adyencomponent.md)*): `void`

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

**Parameters:**

| Param | Type |
| ------ | ------ |
| state | [AdyenComponentState](../#adyencomponentstate) |
| component | [AdyenComponent](adyencomponent.md) |

**Returns:** `void`

___

