[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / AdyenIdealComponentOptions

# Interface: AdyenIdealComponentOptions

## Extends

- [`AdyenBaseCardComponentOptions`](AdyenBaseCardComponentOptions.md).[`AdyenComponentEvents`](AdyenComponentEvents.md)

## Properties

### brands?

> `optional` **brands?**: `string`[]

Array of card brands that will be recognized by the component.

#### Inherited from

[`AdyenBaseCardComponentOptions`](AdyenBaseCardComponentOptions.md).[`brands`](AdyenBaseCardComponentOptions.md#brands)

***

### showBrandsUnderCardNumber?

> `optional` **showBrandsUnderCardNumber?**: `boolean`

#### Inherited from

[`AdyenBaseCardComponentOptions`](AdyenBaseCardComponentOptions.md).[`showBrandsUnderCardNumber`](AdyenBaseCardComponentOptions.md#showbrandsundercardnumber)

***

### showImage?

> `optional` **showImage?**: `boolean`

Optional. Set to **false** to remove the bank logos from the iDEAL form.

***

### styles?

> `optional` **styles?**: [`StyleOptions`](StyleOptions.md)

Set a style object to customize the input fields. See Styling Secured Fields
for a list of supported properties.

#### Inherited from

[`AdyenBaseCardComponentOptions`](AdyenBaseCardComponentOptions.md).[`styles`](AdyenBaseCardComponentOptions.md#styles)

## Methods

### onChange()?

> `optional` **onChange**(`state`, `component`): `void`

Called when the shopper enters data in the card input fields.
Here you have the option to override your main Adyen Checkout configuration.

#### Parameters

##### state

[`AdyenComponentEventState`](../type-aliases/AdyenComponentEventState.md)

##### component

[`AdyenComponent`](AdyenComponent.md)

#### Returns

`void`

#### Inherited from

[`AdyenComponentEvents`](AdyenComponentEvents.md).[`onChange`](AdyenComponentEvents.md#onchange)

***

### onError()?

> `optional` **onError**(`state`, `component`): `void`

Called in case of an invalid card number, invalid expiry date, or
 incomplete field. Called again when errors are cleared.

#### Parameters

##### state

[`AdyenValidationState`](AdyenValidationState.md)

##### component

[`AdyenComponent`](AdyenComponent.md)

#### Returns

`void`

#### Inherited from

[`AdyenComponentEvents`](AdyenComponentEvents.md).[`onError`](AdyenComponentEvents.md#onerror)

***

### onFieldValid()?

> `optional` **onFieldValid**(`state`, `component`): `void`

#### Parameters

##### state

[`AdyenValidationState`](AdyenValidationState.md)

##### component

[`AdyenComponent`](AdyenComponent.md)

#### Returns

`void`

#### Inherited from

[`AdyenComponentEvents`](AdyenComponentEvents.md).[`onFieldValid`](AdyenComponentEvents.md#onfieldvalid)

***

### onSubmit()?

> `optional` **onSubmit**(`state`, `component`): `void`

Called when the shopper selects the Pay button and payment details are valid.

#### Parameters

##### state

[`AdyenComponentEventState`](../type-aliases/AdyenComponentEventState.md)

##### component

[`AdyenComponent`](AdyenComponent.md)

#### Returns

`void`

#### Inherited from

[`AdyenComponentEvents`](AdyenComponentEvents.md).[`onSubmit`](AdyenComponentEvents.md#onsubmit)
