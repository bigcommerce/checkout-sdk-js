[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / CardNumberElementOptions

# Interface: CardNumberElementOptions

[<internal>](../modules/internal_.md).CardNumberElementOptions

## Hierarchy

- [`BaseIndividualElementOptions`](internal_.BaseIndividualElementOptions.md)

  ↳ **`CardNumberElementOptions`**

## Table of contents

### Properties

- [classes](internal_.CardNumberElementOptions.md#classes)
- [containerId](internal_.CardNumberElementOptions.md#containerid)
- [disabled](internal_.CardNumberElementOptions.md#disabled)
- [iconStyle](internal_.CardNumberElementOptions.md#iconstyle)
- [placeholder](internal_.CardNumberElementOptions.md#placeholder)
- [showIcon](internal_.CardNumberElementOptions.md#showicon)
- [style](internal_.CardNumberElementOptions.md#style)

## Properties

### classes

• `Optional` **classes**: [`StripeElementClasses`](internal_.StripeElementClasses.md)

Set custom class names on the container DOM element when the Stripe element is in a particular state.

#### Inherited from

[BaseIndividualElementOptions](internal_.BaseIndividualElementOptions.md).[classes](internal_.BaseIndividualElementOptions.md#classes)

___

### containerId

• **containerId**: `string`

#### Inherited from

[BaseIndividualElementOptions](internal_.BaseIndividualElementOptions.md).[containerId](internal_.BaseIndividualElementOptions.md#containerid)

___

### disabled

• `Optional` **disabled**: `boolean`

Applies a disabled state to the Element such that user input is not accepted. Default is false.

#### Inherited from

[BaseIndividualElementOptions](internal_.BaseIndividualElementOptions.md).[disabled](internal_.BaseIndividualElementOptions.md#disabled)

___

### iconStyle

• `Optional` **iconStyle**: [`IconStyle`](../enums/internal_.IconStyle.md)

Appearance of the icon in the Element. Either `solid` or `default`

___

### placeholder

• `Optional` **placeholder**: `string`

___

### showIcon

• `Optional` **showIcon**: `boolean`

___

### style

• `Optional` **style**: [`StripeElementStyle`](internal_.StripeElementStyle.md)

Customize the appearance of an element using CSS properties passed in a [Style](https://stripe.com/docs/js/appendix/style) object,
which consists of CSS properties nested under objects for each variant.

#### Inherited from

[BaseIndividualElementOptions](internal_.BaseIndividualElementOptions.md).[style](internal_.BaseIndividualElementOptions.md#style)
