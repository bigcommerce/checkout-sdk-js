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

Array of card brands that will be recognized by the component.

___
<a id="details"></a>

### `<Optional>` details

**● details**: *[InputDetail](inputdetail.md)[]*

Set an object containing the details array for type: scheme from the /paymentMethods response.

___
<a id="enablestoredetails"></a>

### `<Optional>` enableStoreDetails

**● enableStoreDetails**: * `undefined` &#124; `false` &#124; `true`
*

Set to true to show the checkbox to save card details for the next payment.

___
<a id="grouptypes"></a>

### `<Optional>` groupTypes

**● groupTypes**: *`string`[]*

Defaults to \['mc','visa','amex'\]. Configure supported card types to facilitate brand recognition used in the Secured Fields onBrand callback. See list of available card types. If a shopper enters a card type not specified in the GroupTypes configuration, the onBrand callback will not be invoked.

___
<a id="hasholdername"></a>

### `<Optional>` hasHolderName

**● hasHolderName**: * `undefined` &#124; `false` &#124; `true`
*

Set to true to request the name of the card holder.

___
<a id="holdername"></a>

### `<Optional>` holderName

**● holderName**: * `undefined` &#124; `string`
*

Prefill the card holder name field. Supported from Card component

___
<a id="holdernamerequired"></a>

### `<Optional>` holderNameRequired

**● holderNameRequired**: * `undefined` &#124; `false` &#124; `true`
*

Set to true to require the card holder name.

___
<a id="placeholders"></a>

### `<Optional>` placeholders

**● placeholders**: * [CreditCardPlaceHolder](creditcardplaceholder.md) &#124; [SepaPlaceHolder](sepaplaceholder.md)
*

Specify the sample values you want to appear for card detail input fields.

___
<a id="styles"></a>

### `<Optional>` styles

**● styles**: *[StyleOptions](styleoptions.md)*

Set a style object to customize the input fields. See Styling Secured Fields for a list of supported properties.

___

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

