[@bigcommerce/checkout-sdk](../README.md) / AdyenCreditCardComponentOptions

# Interface: AdyenCreditCardComponentOptions

## Hierarchy

- [`AdyenBaseCardComponentOptions`](AdyenBaseCardComponentOptions.md)

- [`AdyenComponentEvents`](AdyenComponentEvents.md)

  ↳ **`AdyenCreditCardComponentOptions`**

## Table of contents

### Properties

- [brands](AdyenCreditCardComponentOptions.md#brands)
- [data](AdyenCreditCardComponentOptions.md#data)
- [details](AdyenCreditCardComponentOptions.md#details)
- [enableStoreDetails](AdyenCreditCardComponentOptions.md#enablestoredetails)
- [groupTypes](AdyenCreditCardComponentOptions.md#grouptypes)
- [hasHolderName](AdyenCreditCardComponentOptions.md#hasholdername)
- [holderNameRequired](AdyenCreditCardComponentOptions.md#holdernamerequired)
- [placeholders](AdyenCreditCardComponentOptions.md#placeholders)
- [styles](AdyenCreditCardComponentOptions.md#styles)

### Methods

- [onChange](AdyenCreditCardComponentOptions.md#onchange)
- [onError](AdyenCreditCardComponentOptions.md#onerror)
- [onFieldValid](AdyenCreditCardComponentOptions.md#onfieldvalid)

## Properties

### brands

• `Optional` **brands**: `string`[]

Array of card brands that will be recognized by the component.

#### Inherited from

[AdyenBaseCardComponentOptions](AdyenBaseCardComponentOptions.md).[brands](AdyenBaseCardComponentOptions.md#brands)

___

### data

• `Optional` **data**: [`AdyenPlaceholderData`](AdyenPlaceholderData.md)

Information to prefill fields.

___

### details

• `Optional` **details**: [`InputDetail`](InputDetail.md)[]

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

• `Optional` **placeholders**: [`CreditCardPlaceHolder`](CreditCardPlaceHolder.md) \| [`SepaPlaceHolder`](SepaPlaceHolder.md)

Specify the sample values you want to appear for card detail input fields.

___

### styles

• `Optional` **styles**: [`StyleOptions`](StyleOptions.md)

Set a style object to customize the input fields. See Styling Secured Fields
for a list of supported properties.

#### Inherited from

[AdyenBaseCardComponentOptions](AdyenBaseCardComponentOptions.md).[styles](AdyenBaseCardComponentOptions.md#styles)

## Methods

### onChange

▸ `Optional` **onChange**(`state`, `component`): `void`

Called when the shopper enters data in the card input fields.
Here you have the option to override your main Adyen Checkout configuration.

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`AdyenComponentState`](../README.md#adyencomponentstate) |
| `component` | [`AdyenComponent`](AdyenComponent.md) |

#### Returns

`void`

#### Inherited from

[AdyenComponentEvents](AdyenComponentEvents.md).[onChange](AdyenComponentEvents.md#onchange)

___

### onError

▸ `Optional` **onError**(`state`, `component`): `void`

Called in case of an invalid card number, invalid expiry date, or
 incomplete field. Called again when errors are cleared.

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`AdyenV2ValidationState`](AdyenV2ValidationState.md) |
| `component` | [`AdyenComponent`](AdyenComponent.md) |

#### Returns

`void`

#### Inherited from

[AdyenComponentEvents](AdyenComponentEvents.md).[onError](AdyenComponentEvents.md#onerror)

___

### onFieldValid

▸ `Optional` **onFieldValid**(`state`, `component`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`AdyenV2ValidationState`](AdyenV2ValidationState.md) |
| `component` | [`AdyenComponent`](AdyenComponent.md) |

#### Returns

`void`

#### Inherited from

[AdyenComponentEvents](AdyenComponentEvents.md).[onFieldValid](AdyenComponentEvents.md#onfieldvalid)
