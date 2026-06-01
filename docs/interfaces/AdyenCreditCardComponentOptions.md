[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / AdyenCreditCardComponentOptions

# Interface: AdyenCreditCardComponentOptions

## Extends

- [`AdyenBaseCardComponentOptions`](AdyenBaseCardComponentOptions.md).[`AdyenComponentEvents`](AdyenComponentEvents.md)

## Properties

### brands?

> `optional` **brands?**: `string`[]

Array of card brands that will be recognized by the component.

#### Inherited from

[`AdyenBaseCardComponentOptions`](AdyenBaseCardComponentOptions.md).[`brands`](AdyenBaseCardComponentOptions.md#brands)

***

### data?

> `optional` **data?**: [`AdyenPlaceholderData`](AdyenPlaceholderData.md)

Information to prefill fields.

***

### details?

> `optional` **details?**: [`InputDetail`](InputDetail.md)[]

Set an object containing the details array for type: scheme from
the /paymentMethods response.

***

### enableStoreDetails?

> `optional` **enableStoreDetails?**: `boolean`

Set to true to show the checkbox to save card details for the next payment.

***

### groupTypes?

> `optional` **groupTypes?**: `string`[]

Defaults to ['mc','visa','amex']. Configure supported card types to
facilitate brand recognition used in the Secured Fields onBrand callback.
See list of available card types. If a shopper enters a card type not
specified in the GroupTypes configuration, the onBrand callback will not be invoked.

***

### hasHolderName?

> `optional` **hasHolderName?**: `boolean`

Set to true to request the name of the card holder.

***

### holderNameRequired?

> `optional` **holderNameRequired?**: `boolean`

Set to true to require the card holder name.

***

### placeholders?

> `optional` **placeholders?**: [`CreditCardPlaceHolder`](CreditCardPlaceHolder.md) \| [`SepaPlaceHolder`](SepaPlaceHolder.md)

Specify the sample values you want to appear for card detail input fields.

***

### showBrandsUnderCardNumber?

> `optional` **showBrandsUnderCardNumber?**: `boolean`

#### Inherited from

[`AdyenBaseCardComponentOptions`](AdyenBaseCardComponentOptions.md).[`showBrandsUnderCardNumber`](AdyenBaseCardComponentOptions.md#showbrandsundercardnumber)

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
