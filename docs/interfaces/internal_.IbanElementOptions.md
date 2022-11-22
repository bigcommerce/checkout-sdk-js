[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / IbanElementOptions

# Interface: IbanElementOptions

[<internal>](../modules/internal_.md).IbanElementOptions

## Hierarchy

- [`BaseElementOptions_2`](internal_.BaseElementOptions_2.md)

  ↳ **`IbanElementOptions`**

## Table of contents

### Properties

- [classes](internal_.IbanElementOptions.md#classes)
- [disabled](internal_.IbanElementOptions.md#disabled)
- [iconStyle](internal_.IbanElementOptions.md#iconstyle)
- [placeholderCountry](internal_.IbanElementOptions.md#placeholdercountry)
- [style](internal_.IbanElementOptions.md#style)
- [supportedCountries](internal_.IbanElementOptions.md#supportedcountries)

## Properties

### classes

• `Optional` **classes**: [`StripeElementClasses`](internal_.StripeElementClasses.md)

Set custom class names on the container DOM element when the Stripe element is in a particular state.

#### Inherited from

[BaseElementOptions_2](internal_.BaseElementOptions_2.md).[classes](internal_.BaseElementOptions_2.md#classes)

___

### disabled

• `Optional` **disabled**: `boolean`

Applies a disabled state to the Element such that user input is not accepted. Default is false.

#### Inherited from

[BaseElementOptions_2](internal_.BaseElementOptions_2.md).[disabled](internal_.BaseElementOptions_2.md#disabled)

___

### iconStyle

• `Optional` **iconStyle**: [`IconStyle`](../enums/internal_.IconStyle.md)

Appearance of the icon in the Element.

___

### placeholderCountry

• `Optional` **placeholderCountry**: `string`

Customize the country and format of the placeholder IBAN. Default is DE.

___

### style

• `Optional` **style**: [`StripeElementStyle`](internal_.StripeElementStyle.md)

Customize the appearance of an element using CSS properties passed in a [Style](https://stripe.com/docs/js/appendix/style) object,
which consists of CSS properties nested under objects for each variant.

#### Inherited from

[BaseElementOptions_2](internal_.BaseElementOptions_2.md).[style](internal_.BaseElementOptions_2.md#style)

___

### supportedCountries

• `Optional` **supportedCountries**: `string`[]

Specify the list of countries or country-groups whose IBANs you want to allow.
Must be ['SEPA'].
