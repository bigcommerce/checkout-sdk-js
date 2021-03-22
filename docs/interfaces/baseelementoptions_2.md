[@bigcommerce/checkout-sdk](../README.md) › [BaseElementOptions_2](baseelementoptions_2.md)

# Interface: BaseElementOptions_2

## Hierarchy

* **BaseElementOptions_2**

  ↳ [BaseIndividualElementOptions](baseindividualelementoptions.md)

  ↳ [CardElementOptions](cardelementoptions.md)

  ↳ [IbanElementOptions](ibanelementoptions.md)

  ↳ [IdealElementOptions](idealelementoptions.md)

## Index

### Properties

* [classes](baseelementoptions_2.md#optional-classes)
* [disabled](baseelementoptions_2.md#optional-disabled)
* [style](baseelementoptions_2.md#optional-style)

## Properties

### `Optional` classes

• **classes**? : *[StripeElementClasses](stripeelementclasses.md)*

Set custom class names on the container DOM element when the Stripe element is in a particular state.

___

### `Optional` disabled

• **disabled**? : *undefined | false | true*

Applies a disabled state to the Element such that user input is not accepted. Default is false.

___

### `Optional` style

• **style**? : *[StripeElementStyle](stripeelementstyle.md)*

Customize the appearance of an element using CSS properties passed in a [Style](https://stripe.com/docs/js/appendix/style) object,
which consists of CSS properties nested under objects for each variant.
