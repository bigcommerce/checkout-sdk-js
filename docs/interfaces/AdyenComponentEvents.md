[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / AdyenComponentEvents

# Interface: AdyenComponentEvents

## Extended by

- [`AdyenCreditCardComponentOptions`](AdyenCreditCardComponentOptions.md)
- [`AdyenIdealComponentOptions`](AdyenIdealComponentOptions.md)

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
