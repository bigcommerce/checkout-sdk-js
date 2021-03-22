[@bigcommerce/checkout-sdk](../README.md) › [BaseIndividualElementOptions](baseindividualelementoptions.md)

# Interface: BaseIndividualElementOptions

## Hierarchy

* [BaseElementOptions_2](baseelementoptions_2.md)

  ↳ **BaseIndividualElementOptions**

  ↳ [CardCvcElementOptions](cardcvcelementoptions.md)

  ↳ [CardExpiryElementOptions](cardexpiryelementoptions.md)

  ↳ [CardNumberElementOptions](cardnumberelementoptions.md)

## Index

### Properties

* [classes](baseindividualelementoptions.md#optional-classes)
* [containerId](baseindividualelementoptions.md#containerid)
* [disabled](baseindividualelementoptions.md#optional-disabled)
* [style](baseindividualelementoptions.md#optional-style)

## Properties

### `Optional` classes

• **classes**? : *[StripeElementClasses](stripeelementclasses.md)*

*Inherited from [BaseElementOptions_2](baseelementoptions_2.md).[classes](baseelementoptions_2.md#optional-classes)*

Set custom class names on the container DOM element when the Stripe element is in a particular state.

___

###  containerId

• **containerId**: *string*

___

### `Optional` disabled

• **disabled**? : *undefined | false | true*

*Inherited from [BaseElementOptions_2](baseelementoptions_2.md).[disabled](baseelementoptions_2.md#optional-disabled)*

Applies a disabled state to the Element such that user input is not accepted. Default is false.

___

### `Optional` style

• **style**? : *[StripeElementStyle](stripeelementstyle.md)*

*Inherited from [BaseElementOptions_2](baseelementoptions_2.md).[style](baseelementoptions_2.md#optional-style)*

Customize the appearance of an element using CSS properties passed in a [Style](https://stripe.com/docs/js/appendix/style) object,
which consists of CSS properties nested under objects for each variant.
