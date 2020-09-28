[@bigcommerce/checkout-sdk](../README.md) › [BaseElementOptions](baseelementoptions.md)

# Interface: BaseElementOptions

## Hierarchy

* **BaseElementOptions**

  ↳ [BaseIndividualElementOptions](baseindividualelementoptions.md)

  ↳ [CardElementOptions](cardelementoptions.md)

  ↳ [IbanElementOptions](ibanelementoptions.md)

  ↳ [IdealElementOptions](idealelementoptions.md)

## Index

### Properties

* [classes](baseelementoptions.md#optional-classes)
* [disabled](baseelementoptions.md#optional-disabled)
* [style](baseelementoptions.md#optional-style)

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
