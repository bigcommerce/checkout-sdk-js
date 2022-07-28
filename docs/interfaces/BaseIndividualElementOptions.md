[@bigcommerce/checkout-sdk](../README.md) / BaseIndividualElementOptions

# Interface: BaseIndividualElementOptions

## Hierarchy

- [`BaseElementOptions_2`](BaseElementOptions_2.md)

  ↳ **`BaseIndividualElementOptions`**

  ↳↳ [`CardCvcElementOptions`](CardCvcElementOptions.md)

  ↳↳ [`CardExpiryElementOptions`](CardExpiryElementOptions.md)

  ↳↳ [`CardNumberElementOptions`](CardNumberElementOptions.md)

## Table of contents

### Properties

- [classes](BaseIndividualElementOptions.md#classes)
- [containerId](BaseIndividualElementOptions.md#containerid)
- [disabled](BaseIndividualElementOptions.md#disabled)
- [style](BaseIndividualElementOptions.md#style)

## Properties

### classes

• `Optional` **classes**: [`StripeElementClasses`](StripeElementClasses.md)

Set custom class names on the container DOM element when the Stripe element is in a particular state.

#### Inherited from

[BaseElementOptions_2](BaseElementOptions_2.md).[classes](BaseElementOptions_2.md#classes)

___

### containerId

• **containerId**: `string`

___

### disabled

• `Optional` **disabled**: `boolean`

Applies a disabled state to the Element such that user input is not accepted. Default is false.

#### Inherited from

[BaseElementOptions_2](BaseElementOptions_2.md).[disabled](BaseElementOptions_2.md#disabled)

___

### style

• `Optional` **style**: [`StripeElementStyle`](StripeElementStyle.md)

Customize the appearance of an element using CSS properties passed in a [Style](https://stripe.com/docs/js/appendix/style) object,
which consists of CSS properties nested under objects for each variant.

#### Inherited from

[BaseElementOptions_2](BaseElementOptions_2.md).[style](BaseElementOptions_2.md#style)
