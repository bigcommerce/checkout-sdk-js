[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / CardElementOptions

# Interface: CardElementOptions

[<internal>](../modules/internal_.md).CardElementOptions

## Hierarchy

- [`BaseElementOptions_2`](internal_.BaseElementOptions_2.md)

  ↳ **`CardElementOptions`**

## Table of contents

### Properties

- [classes](internal_.CardElementOptions.md#classes)
- [disabled](internal_.CardElementOptions.md#disabled)
- [hideIcon](internal_.CardElementOptions.md#hideicon)
- [hidePostalCode](internal_.CardElementOptions.md#hidepostalcode)
- [iconStyle](internal_.CardElementOptions.md#iconstyle)
- [style](internal_.CardElementOptions.md#style)
- [value](internal_.CardElementOptions.md#value)

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

### hideIcon

• `Optional` **hideIcon**: `boolean`

___

### hidePostalCode

• `Optional` **hidePostalCode**: `boolean`

Hide the postal code field. Default is false. If you are already collecting a
full billing address or postal code elsewhere, set this to true.

___

### iconStyle

• `Optional` **iconStyle**: [`IconStyle`](../enums/internal_.IconStyle.md)

Appearance of the icon in the Element.

___

### style

• `Optional` **style**: [`StripeElementStyle`](internal_.StripeElementStyle.md)

Customize the appearance of an element using CSS properties passed in a [Style](https://stripe.com/docs/js/appendix/style) object,
which consists of CSS properties nested under objects for each variant.

#### Inherited from

[BaseElementOptions_2](internal_.BaseElementOptions_2.md).[style](internal_.BaseElementOptions_2.md#style)

___

### value

• `Optional` **value**: `string`

A pre-filled set of values to include in the input (e.g., {postalCode: '94110'}).
Note that sensitive card information (card number, CVC, and expiration date)
cannot be pre-filled
