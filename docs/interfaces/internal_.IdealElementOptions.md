[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / IdealElementOptions

# Interface: IdealElementOptions

[<internal>](../modules/internal_.md).IdealElementOptions

## Hierarchy

- [`BaseElementOptions_2`](internal_.BaseElementOptions_2.md)

  ↳ **`IdealElementOptions`**

## Table of contents

### Properties

- [classes](internal_.IdealElementOptions.md#classes)
- [disabled](internal_.IdealElementOptions.md#disabled)
- [hideIcon](internal_.IdealElementOptions.md#hideicon)
- [style](internal_.IdealElementOptions.md#style)
- [value](internal_.IdealElementOptions.md#value)

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

Hides the icon in the Element. Default is false.

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
