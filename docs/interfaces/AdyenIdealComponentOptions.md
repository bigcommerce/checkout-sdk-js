[@bigcommerce/checkout-sdk](../README.md) / AdyenIdealComponentOptions

# Interface: AdyenIdealComponentOptions

## Hierarchy

- [`AdyenBaseCardComponentOptions`](AdyenBaseCardComponentOptions.md)

- [`AdyenComponentEvents`](AdyenComponentEvents.md)

  ↳ **`AdyenIdealComponentOptions`**

## Table of contents

### Properties

- [brands](AdyenIdealComponentOptions.md#brands)
- [showBrandsUnderCardNumber](AdyenIdealComponentOptions.md#showbrandsundercardnumber)
- [showImage](AdyenIdealComponentOptions.md#showimage)
- [styles](AdyenIdealComponentOptions.md#styles)

### Methods

- [onChange](AdyenIdealComponentOptions.md#onchange)
- [onError](AdyenIdealComponentOptions.md#onerror)
- [onFieldValid](AdyenIdealComponentOptions.md#onfieldvalid)
- [onSubmit](AdyenIdealComponentOptions.md#onsubmit)

## Properties

### brands

• `Optional` **brands**: `string`[]

Array of card brands that will be recognized by the component.

#### Inherited from

[AdyenBaseCardComponentOptions](AdyenBaseCardComponentOptions.md).[brands](AdyenBaseCardComponentOptions.md#brands)

___

### showBrandsUnderCardNumber

• `Optional` **showBrandsUnderCardNumber**: `boolean`

#### Inherited from

[AdyenBaseCardComponentOptions](AdyenBaseCardComponentOptions.md).[showBrandsUnderCardNumber](AdyenBaseCardComponentOptions.md#showbrandsundercardnumber)

___

### showImage

• `Optional` **showImage**: `boolean`

Optional. Set to **false** to remove the bank logos from the iDEAL form.

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
| `state` | [`AdyenComponentEventState`](../README.md#adyencomponenteventstate) |
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
| `state` | [`AdyenValidationState`](AdyenValidationState.md) |
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
| `state` | [`AdyenValidationState`](AdyenValidationState.md) |
| `component` | [`AdyenComponent`](AdyenComponent.md) |

#### Returns

`void`

#### Inherited from

[AdyenComponentEvents](AdyenComponentEvents.md).[onFieldValid](AdyenComponentEvents.md#onfieldvalid)

___

### onSubmit

▸ `Optional` **onSubmit**(`state`, `component`): `void`

Called when the shopper selects the Pay button and payment details are valid.

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`AdyenComponentEventState`](../README.md#adyencomponenteventstate) |
| `component` | [`AdyenComponent`](AdyenComponent.md) |

#### Returns

`void`

#### Inherited from

[AdyenComponentEvents](AdyenComponentEvents.md).[onSubmit](AdyenComponentEvents.md#onsubmit)
