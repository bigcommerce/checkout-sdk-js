[@bigcommerce/checkout-sdk](../README.md) / CardNumberElementOptions

# Interface: CardNumberElementOptions

## Hierarchy

- [`BaseIndividualElementOptions`](BaseIndividualElementOptions.md)

  ↳ **`CardNumberElementOptions`**

## Table of contents

### Properties

- [classes](CardNumberElementOptions.md#classes)
- [containerId](CardNumberElementOptions.md#containerid)
- [disabled](CardNumberElementOptions.md#disabled)
- [iconStyle](CardNumberElementOptions.md#iconstyle)
- [placeholder](CardNumberElementOptions.md#placeholder)
- [showIcon](CardNumberElementOptions.md#showicon)
- [style](CardNumberElementOptions.md#style)

## Properties

### classes

• `Optional` **classes**: [`StripeElementClasses`](StripeElementClasses.md)

Set custom class names on the container DOM element when the Stripe element is in a particular state.

#### Inherited from

[BaseIndividualElementOptions](BaseIndividualElementOptions.md).[classes](BaseIndividualElementOptions.md#classes)

___

### containerId

• **containerId**: `string`

#### Inherited from

[BaseIndividualElementOptions](BaseIndividualElementOptions.md).[containerId](BaseIndividualElementOptions.md#containerid)

___

### disabled

• `Optional` **disabled**: `boolean`

Applies a disabled state to the Element such that user input is not accepted. Default is false.

#### Inherited from

[BaseIndividualElementOptions](BaseIndividualElementOptions.md).[disabled](BaseIndividualElementOptions.md#disabled)

___

### iconStyle

• `Optional` **iconStyle**: [`Solid`](../enums/IconStyle.md#solid) \| [`Default`](../enums/IconStyle.md#default)

Appearance of the icon in the Element. Either `solid` or `default`

___

### placeholder

• `Optional` **placeholder**: `string`

___

### showIcon

• `Optional` **showIcon**: `boolean`

___

### style

• `Optional` **style**: [`StripeElementStyle`](StripeElementStyle.md)

Customize the appearance of an element using CSS properties passed in a [Style](https://stripe.com/docs/js/appendix/style) object,
which consists of CSS properties nested under objects for each variant.

#### Inherited from

[BaseIndividualElementOptions](BaseIndividualElementOptions.md).[style](BaseIndividualElementOptions.md#style)
