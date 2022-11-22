[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / BaseIndividualElementOptions

# Interface: BaseIndividualElementOptions

[<internal>](../modules/internal_.md).BaseIndividualElementOptions

## Hierarchy

- [`BaseElementOptions_2`](internal_.BaseElementOptions_2.md)

  ↳ **`BaseIndividualElementOptions`**

  ↳↳ [`CardExpiryElementOptions`](internal_.CardExpiryElementOptions.md)

  ↳↳ [`CardNumberElementOptions`](internal_.CardNumberElementOptions.md)

  ↳↳ [`CardCvcElementOptions`](internal_.CardCvcElementOptions.md)

## Table of contents

### Properties

- [classes](internal_.BaseIndividualElementOptions.md#classes)
- [containerId](internal_.BaseIndividualElementOptions.md#containerid)
- [disabled](internal_.BaseIndividualElementOptions.md#disabled)
- [style](internal_.BaseIndividualElementOptions.md#style)

## Properties

### classes

• `Optional` **classes**: [`StripeElementClasses`](internal_.StripeElementClasses.md)

Set custom class names on the container DOM element when the Stripe element is in a particular state.

#### Inherited from

[BaseElementOptions_2](internal_.BaseElementOptions_2.md).[classes](internal_.BaseElementOptions_2.md#classes)

___

### containerId

• **containerId**: `string`

___

### disabled

• `Optional` **disabled**: `boolean`

Applies a disabled state to the Element such that user input is not accepted. Default is false.

#### Inherited from

[BaseElementOptions_2](internal_.BaseElementOptions_2.md).[disabled](internal_.BaseElementOptions_2.md#disabled)

___

### style

• `Optional` **style**: [`StripeElementStyle`](internal_.StripeElementStyle.md)

Customize the appearance of an element using CSS properties passed in a [Style](https://stripe.com/docs/js/appendix/style) object,
which consists of CSS properties nested under objects for each variant.

#### Inherited from

[BaseElementOptions_2](internal_.BaseElementOptions_2.md).[style](internal_.BaseElementOptions_2.md#style)
