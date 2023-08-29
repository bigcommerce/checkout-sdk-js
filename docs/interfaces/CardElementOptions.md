[@bigcommerce/checkout-sdk](../README.md) / CardElementOptions

# Interface: CardElementOptions

## Hierarchy

- [`BaseElementOptions_2`](BaseElementOptions_2.md)

  ↳ **`CardElementOptions`**

## Table of contents

### Properties

- [classes](CardElementOptions.md#classes)
- [disabled](CardElementOptions.md#disabled)
- [hideIcon](CardElementOptions.md#hideicon)
- [hidePostalCode](CardElementOptions.md#hidepostalcode)
- [iconStyle](CardElementOptions.md#iconstyle)
- [style](CardElementOptions.md#style)
- [value](CardElementOptions.md#value)

## Properties

### classes

• `Optional` **classes**: [`StripeElementClasses`](StripeElementClasses.md)

Set custom class names on the container DOM element when the Stripe element is in a particular state.

#### Inherited from

[BaseElementOptions_2](BaseElementOptions_2.md).[classes](BaseElementOptions_2.md#classes)

___

### disabled

• `Optional` **disabled**: `boolean`

Applies a disabled state to the Element such that user input is not accepted. Default is false.

#### Inherited from

[BaseElementOptions_2](BaseElementOptions_2.md).[disabled](BaseElementOptions_2.md#disabled)

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

• `Optional` **iconStyle**: [`Solid`](../enums/IconStyle.md#solid) \| [`Default`](../enums/IconStyle.md#default)

Appearance of the icon in the Element.

___

### style

• `Optional` **style**: [`StripeElementStyle`](StripeElementStyle.md)

Customize the appearance of an element using CSS properties passed in a [Style](https://stripe.com/docs/js/appendix/style) object,
which consists of CSS properties nested under objects for each variant.

#### Inherited from

[BaseElementOptions_2](BaseElementOptions_2.md).[style](BaseElementOptions_2.md#style)

___

### value

• `Optional` **value**: `string`

A pre-filled set of values to include in the input (e.g., {postalCode: '94110'}).
Note that sensitive card information (card number, CVC, and expiration date)
cannot be pre-filled
