[@bigcommerce/checkout-sdk](../README.md) / AdyenV3CreditCardComponentOptions

# Interface: AdyenV3CreditCardComponentOptions

## Hierarchy

- [`AdyenBaseCardComponentOptions_2`](AdyenBaseCardComponentOptions_2.md)

- [`AdyenComponentEvents_2`](AdyenComponentEvents_2.md)

  ↳ **`AdyenV3CreditCardComponentOptions`**

## Table of contents

### Properties

- [brands](AdyenV3CreditCardComponentOptions.md#brands)
- [data](AdyenV3CreditCardComponentOptions.md#data)
- [details](AdyenV3CreditCardComponentOptions.md#details)
- [enableStoreDetails](AdyenV3CreditCardComponentOptions.md#enablestoredetails)
- [groupTypes](AdyenV3CreditCardComponentOptions.md#grouptypes)
- [hasHolderName](AdyenV3CreditCardComponentOptions.md#hasholdername)
- [holderNameRequired](AdyenV3CreditCardComponentOptions.md#holdernamerequired)
- [placeholders](AdyenV3CreditCardComponentOptions.md#placeholders)
- [showBrandsUnderCardNumber](AdyenV3CreditCardComponentOptions.md#showbrandsundercardnumber)
- [styles](AdyenV3CreditCardComponentOptions.md#styles)

### Methods

- [onChange](AdyenV3CreditCardComponentOptions.md#onchange)
- [onError](AdyenV3CreditCardComponentOptions.md#onerror)
- [onFieldValid](AdyenV3CreditCardComponentOptions.md#onfieldvalid)

## Properties

### brands

• `Optional` **brands**: `string`[]

Array of card brands that will be recognized by the component.

#### Inherited from

[AdyenBaseCardComponentOptions_2](AdyenBaseCardComponentOptions_2.md).[brands](AdyenBaseCardComponentOptions_2.md#brands)

___

### data

• `Optional` **data**: [`AdyenPlaceholderData_2`](AdyenPlaceholderData_2.md)

Information to prefill fields.

___

### details

• `Optional` **details**: [`InputDetail_2`](InputDetail_2.md)[]

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

• `Optional` **placeholders**: [`CreditCardPlaceHolder_2`](CreditCardPlaceHolder_2.md) \| [`SepaPlaceHolder_2`](SepaPlaceHolder_2.md)

Specify the sample values you want to appear for card detail input fields.

___

### showBrandsUnderCardNumber

• `Optional` **showBrandsUnderCardNumber**: `boolean`

#### Inherited from

[AdyenBaseCardComponentOptions_2](AdyenBaseCardComponentOptions_2.md).[showBrandsUnderCardNumber](AdyenBaseCardComponentOptions_2.md#showbrandsundercardnumber)

___

### styles

• `Optional` **styles**: [`StyleOptions_2`](StyleOptions_2.md)

Set a style object to customize the input fields. See Styling Secured Fields
for a list of supported properties.

#### Inherited from

[AdyenBaseCardComponentOptions_2](AdyenBaseCardComponentOptions_2.md).[styles](AdyenBaseCardComponentOptions_2.md#styles)

## Methods

### onChange

▸ `Optional` **onChange**(`state`, `component`): `void`

Called when the shopper enters data in the card input fields.
Here you have the option to override your main Adyen Checkout configuration.

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`AdyenV3ComponentState`](../README.md#adyenv3componentstate) |
| `component` | [`AdyenComponent_2`](AdyenComponent_2.md) |

#### Returns

`void`

#### Inherited from

[AdyenComponentEvents_2](AdyenComponentEvents_2.md).[onChange](AdyenComponentEvents_2.md#onchange)

___

### onError

▸ `Optional` **onError**(`state`, `component`): `void`

Called in case of an invalid card number, invalid expiry date, or
 incomplete field. Called again when errors are cleared.

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`AdyenV3ValidationState`](AdyenV3ValidationState.md) |
| `component` | [`AdyenComponent_2`](AdyenComponent_2.md) |

#### Returns

`void`

#### Inherited from

[AdyenComponentEvents_2](AdyenComponentEvents_2.md).[onError](AdyenComponentEvents_2.md#onerror)

___

### onFieldValid

▸ `Optional` **onFieldValid**(`state`, `component`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`AdyenV3ValidationState`](AdyenV3ValidationState.md) |
| `component` | [`AdyenComponent_2`](AdyenComponent_2.md) |

#### Returns

`void`

#### Inherited from

[AdyenComponentEvents_2](AdyenComponentEvents_2.md).[onFieldValid](AdyenComponentEvents_2.md#onfieldvalid)
