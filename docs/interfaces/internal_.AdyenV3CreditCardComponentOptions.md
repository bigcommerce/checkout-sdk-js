[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / AdyenV3CreditCardComponentOptions

# Interface: AdyenV3CreditCardComponentOptions

[<internal>](../modules/internal_.md).AdyenV3CreditCardComponentOptions

## Hierarchy

- [`AdyenBaseCardComponentOptions_2`](internal_.AdyenBaseCardComponentOptions_2.md)

- [`AdyenComponentEvents_2`](internal_.AdyenComponentEvents_2.md)

  ↳ **`AdyenV3CreditCardComponentOptions`**

## Table of contents

### Properties

- [brands](internal_.AdyenV3CreditCardComponentOptions.md#brands)
- [data](internal_.AdyenV3CreditCardComponentOptions.md#data)
- [details](internal_.AdyenV3CreditCardComponentOptions.md#details)
- [enableStoreDetails](internal_.AdyenV3CreditCardComponentOptions.md#enablestoredetails)
- [groupTypes](internal_.AdyenV3CreditCardComponentOptions.md#grouptypes)
- [hasHolderName](internal_.AdyenV3CreditCardComponentOptions.md#hasholdername)
- [holderNameRequired](internal_.AdyenV3CreditCardComponentOptions.md#holdernamerequired)
- [placeholders](internal_.AdyenV3CreditCardComponentOptions.md#placeholders)
- [showBrandsUnderCardNumber](internal_.AdyenV3CreditCardComponentOptions.md#showbrandsundercardnumber)
- [styles](internal_.AdyenV3CreditCardComponentOptions.md#styles)

### Methods

- [onChange](internal_.AdyenV3CreditCardComponentOptions.md#onchange)
- [onError](internal_.AdyenV3CreditCardComponentOptions.md#onerror)
- [onFieldValid](internal_.AdyenV3CreditCardComponentOptions.md#onfieldvalid)

## Properties

### brands

• `Optional` **brands**: `string`[]

Array of card brands that will be recognized by the component.

#### Inherited from

[AdyenBaseCardComponentOptions_2](internal_.AdyenBaseCardComponentOptions_2.md).[brands](internal_.AdyenBaseCardComponentOptions_2.md#brands)

___

### data

• `Optional` **data**: [`AdyenPlaceholderData_2`](internal_.AdyenPlaceholderData_2.md)

Information to prefill fields.

___

### details

• `Optional` **details**: [`InputDetail_2`](internal_.InputDetail_2.md)[]

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

• `Optional` **placeholders**: [`CreditCardPlaceHolder_2`](internal_.CreditCardPlaceHolder_2.md) \| [`SepaPlaceHolder_2`](internal_.SepaPlaceHolder_2.md)

Specify the sample values you want to appear for card detail input fields.

___

### showBrandsUnderCardNumber

• `Optional` **showBrandsUnderCardNumber**: `boolean`

#### Inherited from

[AdyenBaseCardComponentOptions_2](internal_.AdyenBaseCardComponentOptions_2.md).[showBrandsUnderCardNumber](internal_.AdyenBaseCardComponentOptions_2.md#showbrandsundercardnumber)

___

### styles

• `Optional` **styles**: [`StyleOptions_2`](internal_.StyleOptions_2.md)

Set a style object to customize the input fields. See Styling Secured Fields
for a list of supported properties.

#### Inherited from

[AdyenBaseCardComponentOptions_2](internal_.AdyenBaseCardComponentOptions_2.md).[styles](internal_.AdyenBaseCardComponentOptions_2.md#styles)

## Methods

### onChange

▸ `Optional` **onChange**(`state`, `component`): `void`

Called when the shopper enters data in the card input fields.
Here you have the option to override your main Adyen Checkout configuration.

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`AdyenV3ComponentState`](../modules/internal_.md#adyenv3componentstate) |
| `component` | [`AdyenComponent_2`](internal_.AdyenComponent_2.md) |

#### Returns

`void`

#### Inherited from

[AdyenComponentEvents_2](internal_.AdyenComponentEvents_2.md).[onChange](internal_.AdyenComponentEvents_2.md#onchange)

___

### onError

▸ `Optional` **onError**(`state`, `component`): `void`

Called in case of an invalid card number, invalid expiry date, or
 incomplete field. Called again when errors are cleared.

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`AdyenV3ValidationState`](internal_.AdyenV3ValidationState.md) |
| `component` | [`AdyenComponent_2`](internal_.AdyenComponent_2.md) |

#### Returns

`void`

#### Inherited from

[AdyenComponentEvents_2](internal_.AdyenComponentEvents_2.md).[onError](internal_.AdyenComponentEvents_2.md#onerror)

___

### onFieldValid

▸ `Optional` **onFieldValid**(`state`, `component`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`AdyenV3ValidationState`](internal_.AdyenV3ValidationState.md) |
| `component` | [`AdyenComponent_2`](internal_.AdyenComponent_2.md) |

#### Returns

`void`

#### Inherited from

[AdyenComponentEvents_2](internal_.AdyenComponentEvents_2.md).[onFieldValid](internal_.AdyenComponentEvents_2.md#onfieldvalid)
