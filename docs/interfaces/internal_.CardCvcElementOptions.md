[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / CardCvcElementOptions

# Interface: CardCvcElementOptions

[<internal>](../modules/internal_.md).CardCvcElementOptions

## Hierarchy

- [`BaseIndividualElementOptions`](internal_.BaseIndividualElementOptions.md)

  ↳ **`CardCvcElementOptions`**

## Table of contents

### Properties

- [classes](internal_.CardCvcElementOptions.md#classes)
- [containerId](internal_.CardCvcElementOptions.md#containerid)
- [disabled](internal_.CardCvcElementOptions.md#disabled)
- [placeholder](internal_.CardCvcElementOptions.md#placeholder)
- [style](internal_.CardCvcElementOptions.md#style)

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

### placeholder

• `Optional` **placeholder**: `string`

___

### style

• `Optional` **style**: [`StripeElementStyle`](internal_.StripeElementStyle.md)

Customize the appearance of an element using CSS properties passed in a [Style](https://stripe.com/docs/js/appendix/style) object,
which consists of CSS properties nested under objects for each variant.

#### Inherited from

[BaseIndividualElementOptions](internal_.BaseIndividualElementOptions.md).[style](internal_.BaseIndividualElementOptions.md#style)
