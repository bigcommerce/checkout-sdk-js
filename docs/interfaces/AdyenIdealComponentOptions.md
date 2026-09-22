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

Adyen v2/Adyen v3 (SDK <6, behind the PI-5661.adyen_sdk_upgrade experiment) only.
No longer used in Adyen v3 (SDK 6+).

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

Adyen v2, and Adyen v3 unless the PI-5661.adyen_sdk_upgrade experiment is enabled.
Called in case of an invalid card number, invalid expiry date, or incomplete field.
Called again when errors are cleared.

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

Adyen v2, and Adyen v3 unless the PI-5661.adyen_sdk_upgrade experiment is enabled.
Called when a field becomes valid.

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

> `optional` **onSubmit**(`state`, `component`, `actions?`): `void`

Called when the shopper selects the Pay button and payment details are valid.

With the PI-5661.adyen_sdk_upgrade experiment enabled (SDK 6+), this callback
receives a third `actions` argument. The Component's internal submit flow will not
continue until `actions.resolve()` or `actions.reject()` is called.

#### Parameters

##### state

[`AdyenComponentEventState`](../type-aliases/AdyenComponentEventState.md)

##### component

[`AdyenComponent`](AdyenComponent.md)

##### actions?

[`AdyenActions`](AdyenActions.md)

#### Returns

`void`

#### Inherited from

[`AdyenComponentEvents`](AdyenComponentEvents.md).[`onSubmit`](AdyenComponentEvents.md#onsubmit)

***

### onValidationError()?

> `optional` **onValidationError**(`state`, `component`): `void`

Adyen v3 with the PI-5661.adyen_sdk_upgrade experiment enabled (SDK 6+) only.
Called with one entry per field in case of an invalid card number, invalid expiry
date, or incomplete field, and again when a field becomes valid or errors are cleared.

#### Parameters

##### state

[`AdyenFieldValidationResult`](AdyenFieldValidationResult.md)[]

##### component

[`AdyenComponent`](AdyenComponent.md)

#### Returns

`void`

#### Inherited from

[`AdyenComponentEvents`](AdyenComponentEvents.md).[`onValidationError`](AdyenComponentEvents.md#onvalidationerror)
