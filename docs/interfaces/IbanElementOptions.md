[@bigcommerce/checkout-sdk](../README.md) / IbanElementOptions

# Interface: IbanElementOptions

## Hierarchy

- [`BaseElementOptions`](BaseElementOptions.md)

  ↳ **`IbanElementOptions`**

## Table of contents

### Properties

- [classes](IbanElementOptions.md#classes)
- [disabled](IbanElementOptions.md#disabled)
- [iconStyle](IbanElementOptions.md#iconstyle)
- [placeholderCountry](IbanElementOptions.md#placeholdercountry)
- [style](IbanElementOptions.md#style)
- [supportedCountries](IbanElementOptions.md#supportedcountries)

## Properties

### classes

• `Optional` **classes**: [`StripeElementClasses`](StripeElementClasses.md)

Set custom class names on the container DOM element when the Stripe element is in a particular state.

#### Inherited from

[BaseElementOptions](BaseElementOptions.md).[classes](BaseElementOptions.md#classes)

___

### disabled

• `Optional` **disabled**: `boolean`

Applies a disabled state to the Element such that user input is not accepted. Default is false.

#### Inherited from

[BaseElementOptions](BaseElementOptions.md).[disabled](BaseElementOptions.md#disabled)

___

### iconStyle

• `Optional` **iconStyle**: [`IconStyle`](../enums/IconStyle.md)

Appearance of the icon in the Element.

___

### placeholderCountry

• `Optional` **placeholderCountry**: `string`

Customize the country and format of the placeholder IBAN. Default is DE.

___

### style

• `Optional` **style**: [`StripeElementStyle`](StripeElementStyle.md)

Customize the appearance of an element using CSS properties passed in a [Style](https://stripe.com/docs/js/appendix/style) object,
which consists of CSS properties nested under objects for each variant.

#### Inherited from

[BaseElementOptions](BaseElementOptions.md).[style](BaseElementOptions.md#style)

___

### supportedCountries

• `Optional` **supportedCountries**: `string`[]

Specify the list of countries or country-groups whose IBANs you want to allow.
Must be ['SEPA'].
