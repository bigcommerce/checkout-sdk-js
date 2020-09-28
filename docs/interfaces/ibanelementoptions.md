[@bigcommerce/checkout-sdk](../README.md) › [IbanElementOptions](ibanelementoptions.md)

# Interface: IbanElementOptions

## Hierarchy

* [BaseElementOptions](baseelementoptions.md)

  ↳ **IbanElementOptions**

## Index

### Properties

* [classes](ibanelementoptions.md#optional-classes)
* [disabled](ibanelementoptions.md#optional-disabled)
* [iconStyle](ibanelementoptions.md#optional-iconstyle)
* [placeholderCountry](ibanelementoptions.md#optional-placeholdercountry)
* [style](ibanelementoptions.md#optional-style)
* [supportedCountries](ibanelementoptions.md#optional-supportedcountries)

## Properties

### `Optional` classes

• **classes**? : *[StripeElementClasses](stripeelementclasses.md)*

*Inherited from [BaseElementOptions](baseelementoptions.md).[classes](baseelementoptions.md#optional-classes)*

Set custom class names on the container DOM element when the Stripe element is in a particular state.

___

### `Optional` disabled

• **disabled**? : *undefined | false | true*

*Inherited from [BaseElementOptions](baseelementoptions.md).[disabled](baseelementoptions.md#optional-disabled)*

Applies a disabled state to the Element such that user input is not accepted. Default is false.

___

### `Optional` iconStyle

• **iconStyle**? : *[IconStyle](../enums/iconstyle.md)*

Appearance of the icon in the Element.

___

### `Optional` placeholderCountry

• **placeholderCountry**? : *undefined | string*

Customize the country and format of the placeholder IBAN. Default is DE.

___

### `Optional` style

• **style**? : *[StripeElementStyle](stripeelementstyle.md)*

*Inherited from [BaseElementOptions](baseelementoptions.md).[style](baseelementoptions.md#optional-style)*

Customize the appearance of an element using CSS properties passed in a [Style](https://stripe.com/docs/js/appendix/style) object,
which consists of CSS properties nested under objects for each variant.

___

### `Optional` supportedCountries

• **supportedCountries**? : *string[]*

Specify the list of countries or country-groups whose IBANs you want to allow.
Must be ['SEPA'].
