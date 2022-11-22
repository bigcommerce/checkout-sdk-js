[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / BaseElementOptions\_2

# Interface: BaseElementOptions\_2

[<internal>](../modules/internal_.md).BaseElementOptions_2

## Hierarchy

- **`BaseElementOptions_2`**

  ↳ [`CardElementOptions`](internal_.CardElementOptions.md)

  ↳ [`IdealElementOptions`](internal_.IdealElementOptions.md)

  ↳ [`IbanElementOptions`](internal_.IbanElementOptions.md)

  ↳ [`BaseIndividualElementOptions`](internal_.BaseIndividualElementOptions.md)

## Table of contents

### Properties

- [classes](internal_.BaseElementOptions_2.md#classes)
- [disabled](internal_.BaseElementOptions_2.md#disabled)
- [style](internal_.BaseElementOptions_2.md#style)

## Properties

### classes

• `Optional` **classes**: [`StripeElementClasses`](internal_.StripeElementClasses.md)

Set custom class names on the container DOM element when the Stripe element is in a particular state.

___

### disabled

• `Optional` **disabled**: `boolean`

Applies a disabled state to the Element such that user input is not accepted. Default is false.

___

### style

• `Optional` **style**: [`StripeElementStyle`](internal_.StripeElementStyle.md)

Customize the appearance of an element using CSS properties passed in a [Style](https://stripe.com/docs/js/appendix/style) object,
which consists of CSS properties nested under objects for each variant.
