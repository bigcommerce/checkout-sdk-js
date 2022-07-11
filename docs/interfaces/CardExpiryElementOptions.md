[@bigcommerce/checkout-sdk](../README.md) / CardExpiryElementOptions

# Interface: CardExpiryElementOptions

## Hierarchy

- [`BaseIndividualElementOptions`](BaseIndividualElementOptions.md)

  ↳ **`CardExpiryElementOptions`**

## Table of contents

### Properties

- [classes](CardExpiryElementOptions.md#classes)
- [containerId](CardExpiryElementOptions.md#containerid)
- [disabled](CardExpiryElementOptions.md#disabled)
- [placeholder](CardExpiryElementOptions.md#placeholder)
- [style](CardExpiryElementOptions.md#style)

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

### placeholder

• `Optional` **placeholder**: `string`

___

### style

• `Optional` **style**: [`StripeElementStyle`](StripeElementStyle.md)

Customize the appearance of an element using CSS properties passed in a [Style](https://stripe.com/docs/js/appendix/style) object,
which consists of CSS properties nested under objects for each variant.

#### Inherited from

[BaseIndividualElementOptions](BaseIndividualElementOptions.md).[style](BaseIndividualElementOptions.md#style)
