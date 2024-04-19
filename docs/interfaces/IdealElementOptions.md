[@bigcommerce/checkout-sdk](../README.md) / IdealElementOptions

# Interface: IdealElementOptions

## Hierarchy

- [`BaseElementOptions_2`](BaseElementOptions_2.md)

  ↳ **`IdealElementOptions`**

## Table of contents

### Properties

- [classes](IdealElementOptions.md#classes)
- [disabled](IdealElementOptions.md#disabled)
- [hideIcon](IdealElementOptions.md#hideicon)
- [style](IdealElementOptions.md#style)
- [value](IdealElementOptions.md#value)

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

Hides the icon in the Element. Default is false.

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
