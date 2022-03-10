[@bigcommerce/checkout-sdk](../README.md) › [AdyenV3CreditCardComponentOptions](adyenv3creditcardcomponentoptions.md)

# Interface: AdyenV3CreditCardComponentOptions

## Hierarchy

* [AdyenBaseCardComponentOptions_2](adyenbasecardcomponentoptions_2.md)

* [AdyenComponentEvents_2](adyencomponentevents_2.md)

  ↳ **AdyenV3CreditCardComponentOptions**

## Index

### Properties

* [brands](adyenv3creditcardcomponentoptions.md#optional-brands)
* [data](adyenv3creditcardcomponentoptions.md#optional-data)
* [details](adyenv3creditcardcomponentoptions.md#optional-details)
* [enableStoreDetails](adyenv3creditcardcomponentoptions.md#optional-enablestoredetails)
* [groupTypes](adyenv3creditcardcomponentoptions.md#optional-grouptypes)
* [hasHolderName](adyenv3creditcardcomponentoptions.md#optional-hasholdername)
* [holderNameRequired](adyenv3creditcardcomponentoptions.md#optional-holdernamerequired)
* [placeholders](adyenv3creditcardcomponentoptions.md#optional-placeholders)
* [styles](adyenv3creditcardcomponentoptions.md#optional-styles)

### Methods

* [onChange](adyenv3creditcardcomponentoptions.md#optional-onchange)
* [onError](adyenv3creditcardcomponentoptions.md#optional-onerror)
* [onFieldValid](adyenv3creditcardcomponentoptions.md#optional-onfieldvalid)

## Properties

### `Optional` brands

• **brands**? : *string[]*

*Inherited from [AdyenBaseCardComponentOptions_2](adyenbasecardcomponentoptions_2.md).[brands](adyenbasecardcomponentoptions_2.md#optional-brands)*

Array of card brands that will be recognized by the component.

___

### `Optional` data

• **data**? : *[AdyenPlaceholderData_2](adyenplaceholderdata_2.md)*

Information to prefill fields.

___

### `Optional` details

• **details**? : *[InputDetail_2](inputdetail_2.md)[]*

Set an object containing the details array for type: scheme from
the /paymentMethods response.

___

### `Optional` enableStoreDetails

• **enableStoreDetails**? : *undefined | false | true*

Set to true to show the checkbox to save card details for the next payment.

___

### `Optional` groupTypes

• **groupTypes**? : *string[]*

Defaults to ['mc','visa','amex']. Configure supported card types to
facilitate brand recognition used in the Secured Fields onBrand callback.
See list of available card types. If a shopper enters a card type not
specified in the GroupTypes configuration, the onBrand callback will not be invoked.

___

### `Optional` hasHolderName

• **hasHolderName**? : *undefined | false | true*

Set to true to request the name of the card holder.

___

### `Optional` holderNameRequired

• **holderNameRequired**? : *undefined | false | true*

Set to true to require the card holder name.

___

### `Optional` placeholders

• **placeholders**? : *[CreditCardPlaceHolder_2](creditcardplaceholder_2.md) | [SepaPlaceHolder_2](sepaplaceholder_2.md)*

Specify the sample values you want to appear for card detail input fields.

___

### `Optional` styles

• **styles**? : *[StyleOptions_2](styleoptions_2.md)*

*Inherited from [AdyenBaseCardComponentOptions_2](adyenbasecardcomponentoptions_2.md).[styles](adyenbasecardcomponentoptions_2.md#optional-styles)*

Set a style object to customize the input fields. See Styling Secured Fields
for a list of supported properties.

## Methods

### `Optional` onChange

▸ **onChange**(`state`: [AdyenV3ComponentState](../README.md#adyenv3componentstate), `component`: [AdyenComponent_2](adyencomponent_2.md)): *void*

*Inherited from [AdyenComponentEvents_2](adyencomponentevents_2.md).[onChange](adyencomponentevents_2.md#optional-onchange)*

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

*Inherited from [AdyenComponentEvents_2](adyencomponentevents_2.md).[onError](adyencomponentevents_2.md#optional-onerror)*

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

*Inherited from [AdyenComponentEvents_2](adyencomponentevents_2.md).[onFieldValid](adyencomponentevents_2.md#optional-onfieldvalid)*

**Parameters:**

Name | Type |
------ | ------ |
`state` | [AdyenV3ComponentState](../README.md#adyenv3componentstate) |
`component` | [AdyenComponent_2](adyencomponent_2.md) |

**Returns:** *void*
