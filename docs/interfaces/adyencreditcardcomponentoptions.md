[@bigcommerce/checkout-sdk](../README.md) › [AdyenCreditCardComponentOptions](adyencreditcardcomponentoptions.md)

# Interface: AdyenCreditCardComponentOptions

## Hierarchy

* [AdyenBaseCardComponentOptions](adyenbasecardcomponentoptions.md)

* [AdyenComponentEvents](adyencomponentevents.md)

  ↳ **AdyenCreditCardComponentOptions**

## Index

### Properties

* [brands](adyencreditcardcomponentoptions.md#optional-brands)
* [details](adyencreditcardcomponentoptions.md#optional-details)
* [enableStoreDetails](adyencreditcardcomponentoptions.md#optional-enablestoredetails)
* [groupTypes](adyencreditcardcomponentoptions.md#optional-grouptypes)
* [hasHolderName](adyencreditcardcomponentoptions.md#optional-hasholdername)
* [holderName](adyencreditcardcomponentoptions.md#optional-holdername)
* [holderNameRequired](adyencreditcardcomponentoptions.md#optional-holdernamerequired)
* [placeholders](adyencreditcardcomponentoptions.md#optional-placeholders)
* [styles](adyencreditcardcomponentoptions.md#optional-styles)

### Methods

* [onChange](adyencreditcardcomponentoptions.md#optional-onchange)
* [onError](adyencreditcardcomponentoptions.md#optional-onerror)

## Properties

### `Optional` brands

• **brands**? : *string[]*

*Inherited from [AdyenBaseCardComponentOptions](adyenbasecardcomponentoptions.md).[brands](adyenbasecardcomponentoptions.md#optional-brands)*

Array of card brands that will be recognized by the component.

___

### `Optional` details

• **details**? : *[InputDetail](inputdetail.md)[]*

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

### `Optional` holderName

• **holderName**? : *undefined | string*

Prefill the card holder name field. Supported from Card component

___

### `Optional` holderNameRequired

• **holderNameRequired**? : *undefined | false | true*

Set to true to require the card holder name.

___

### `Optional` placeholders

• **placeholders**? : *[CreditCardPlaceHolder](creditcardplaceholder.md) | [SepaPlaceHolder](sepaplaceholder.md)*

Specify the sample values you want to appear for card detail input fields.

___

### `Optional` styles

• **styles**? : *[StyleOptions](styleoptions.md)*

*Inherited from [AdyenBaseCardComponentOptions](adyenbasecardcomponentoptions.md).[styles](adyenbasecardcomponentoptions.md#optional-styles)*

Set a style object to customize the input fields. See Styling Secured Fields
for a list of supported properties.

## Methods

### `Optional` onChange

▸ **onChange**(`state`: [AdyenComponentState](../README.md#adyencomponentstate), `component`: [AdyenComponent](adyencomponent.md)): *void*

*Inherited from [AdyenComponentEvents](adyencomponentevents.md).[onChange](adyencomponentevents.md#optional-onchange)*

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

*Inherited from [AdyenComponentEvents](adyencomponentevents.md).[onError](adyencomponentevents.md#optional-onerror)*

Called in case of an invalid card number, invalid expiry date, or
 incomplete field. Called again when errors are cleared.

**Parameters:**

Name | Type |
------ | ------ |
`state` | [AdyenComponentState](../README.md#adyencomponentstate) |
`component` | [AdyenComponent](adyencomponent.md) |

**Returns:** *void*
