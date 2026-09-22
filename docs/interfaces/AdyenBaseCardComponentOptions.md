[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / AdyenBaseCardComponentOptions

# Interface: AdyenBaseCardComponentOptions

## Extended by

- [`AdyenCreditCardComponentOptions`](AdyenCreditCardComponentOptions.md)
- [`AdyenIdealComponentOptions`](AdyenIdealComponentOptions.md)

## Properties

### brands?

> `optional` **brands?**: `string`[]

Array of card brands that will be recognized by the component.

***

### showBrandsUnderCardNumber?

> `optional` **showBrandsUnderCardNumber?**: `boolean`

Adyen v2/Adyen v3 (SDK <6, behind the PI-5661.adyen_sdk_upgrade experiment) only.
No longer used in Adyen v3 (SDK 6+).

***

### styles?

> `optional` **styles?**: [`StyleOptions`](StyleOptions.md)

Set a style object to customize the input fields. See Styling Secured Fields
for a list of supported properties.
