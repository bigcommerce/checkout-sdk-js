[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / AdyenCreditCardComponentOptions

# Interface: AdyenCreditCardComponentOptions

[<internal>](../modules/internal_.md).AdyenCreditCardComponentOptions

## Hierarchy

- [`AdyenBaseCardComponentOptions`](internal_.AdyenBaseCardComponentOptions.md)

- [`AdyenComponentEvents`](internal_.AdyenComponentEvents.md)

  ↳ **`AdyenCreditCardComponentOptions`**

## Table of contents

### Properties

- [brands](internal_.AdyenCreditCardComponentOptions.md#brands)
- [data](internal_.AdyenCreditCardComponentOptions.md#data)
- [details](internal_.AdyenCreditCardComponentOptions.md#details)
- [enableStoreDetails](internal_.AdyenCreditCardComponentOptions.md#enablestoredetails)
- [groupTypes](internal_.AdyenCreditCardComponentOptions.md#grouptypes)
- [hasHolderName](internal_.AdyenCreditCardComponentOptions.md#hasholdername)
- [holderNameRequired](internal_.AdyenCreditCardComponentOptions.md#holdernamerequired)
- [placeholders](internal_.AdyenCreditCardComponentOptions.md#placeholders)
- [styles](internal_.AdyenCreditCardComponentOptions.md#styles)

### Methods

- [onChange](internal_.AdyenCreditCardComponentOptions.md#onchange)
- [onError](internal_.AdyenCreditCardComponentOptions.md#onerror)
- [onFieldValid](internal_.AdyenCreditCardComponentOptions.md#onfieldvalid)

## Properties

### brands

• `Optional` **brands**: `string`[]

Array of card brands that will be recognized by the component.

#### Inherited from

[AdyenBaseCardComponentOptions](internal_.AdyenBaseCardComponentOptions.md).[brands](internal_.AdyenBaseCardComponentOptions.md#brands)

___

### data

• `Optional` **data**: [`AdyenPlaceholderData`](internal_.AdyenPlaceholderData.md)

Information to prefill fields.

___

### details

• `Optional` **details**: [`InputDetail`](internal_.InputDetail.md)[]

Set an object containing the details array for type: scheme from
the /paymentMethods response.

___

### enableStoreDetails

• `Optional` **enableStoreDetails**: `boolean`

Set to true to show the checkbox to save card details for the next payment.

___

### groupTypes

• `Optional` **groupTypes**: `string`[]

Defaults to ['mc','visa','amex']. Configure supported card types to
facilitate brand recognition used in the Secured Fields onBrand callback.
See list of available card types. If a shopper enters a card type not
specified in the GroupTypes configuration, the onBrand callback will not be invoked.

___

### hasHolderName

• `Optional` **hasHolderName**: `boolean`

Set to true to request the name of the card holder.

___

### holderNameRequired

• `Optional` **holderNameRequired**: `boolean`

Set to true to require the card holder name.

___

### placeholders

• `Optional` **placeholders**: [`CreditCardPlaceHolder`](internal_.CreditCardPlaceHolder.md) \| [`SepaPlaceHolder`](internal_.SepaPlaceHolder.md)

Specify the sample values you want to appear for card detail input fields.

___

### styles

• `Optional` **styles**: [`StyleOptions`](internal_.StyleOptions.md)

Set a style object to customize the input fields. See Styling Secured Fields
for a list of supported properties.

#### Inherited from

[AdyenBaseCardComponentOptions](internal_.AdyenBaseCardComponentOptions.md).[styles](internal_.AdyenBaseCardComponentOptions.md#styles)

## Methods

### onChange

▸ `Optional` **onChange**(`state`, `component`): `void`

Called when the shopper enters data in the card input fields.
Here you have the option to override your main Adyen Checkout configuration.

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`AdyenComponentState`](../modules/internal_.md#adyencomponentstate) |
| `component` | [`AdyenComponent`](internal_.AdyenComponent.md) |

#### Returns

`void`

#### Inherited from

[AdyenComponentEvents](internal_.AdyenComponentEvents.md).[onChange](internal_.AdyenComponentEvents.md#onchange)

___

### onError

▸ `Optional` **onError**(`state`, `component`): `void`

Called in case of an invalid card number, invalid expiry date, or
 incomplete field. Called again when errors are cleared.

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`AdyenV2ValidationState`](internal_.AdyenV2ValidationState.md) |
| `component` | [`AdyenComponent`](internal_.AdyenComponent.md) |

#### Returns

`void`

#### Inherited from

[AdyenComponentEvents](internal_.AdyenComponentEvents.md).[onError](internal_.AdyenComponentEvents.md#onerror)

___

### onFieldValid

▸ `Optional` **onFieldValid**(`state`, `component`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`AdyenV2ValidationState`](internal_.AdyenV2ValidationState.md) |
| `component` | [`AdyenComponent`](internal_.AdyenComponent.md) |

#### Returns

`void`

#### Inherited from

[AdyenComponentEvents](internal_.AdyenComponentEvents.md).[onFieldValid](internal_.AdyenComponentEvents.md#onfieldvalid)
