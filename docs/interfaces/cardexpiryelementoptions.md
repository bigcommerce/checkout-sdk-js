[@bigcommerce/checkout-sdk](../README.md) › [CardExpiryElementOptions](cardexpiryelementoptions.md)

# Interface: CardExpiryElementOptions

## Hierarchy

  ↳ [BaseIndividualElementOptions](baseindividualelementoptions.md)

  ↳ **CardExpiryElementOptions**

## Index

### Properties

* [classes](cardexpiryelementoptions.md#optional-classes)
* [containerId](cardexpiryelementoptions.md#containerid)
* [disabled](cardexpiryelementoptions.md#optional-disabled)
* [placeholder](cardexpiryelementoptions.md#optional-placeholder)
* [style](cardexpiryelementoptions.md#optional-style)

## Properties

### `Optional` classes

• **classes**? : *[StripeElementClasses](stripeelementclasses.md)*

*Inherited from [BaseElementOptions](baseelementoptions.md).[classes](baseelementoptions.md#optional-classes)*

Set custom class names on the container DOM element when the Stripe element is in a particular state.

___

###  containerId

• **containerId**: *string*

*Inherited from [BaseIndividualElementOptions](baseindividualelementoptions.md).[containerId](baseindividualelementoptions.md#containerid)*

___

### `Optional` disabled

• **disabled**? : *undefined | false | true*

*Inherited from [BaseElementOptions](baseelementoptions.md).[disabled](baseelementoptions.md#optional-disabled)*

Applies a disabled state to the Element such that user input is not accepted. Default is false.

___

### `Optional` placeholder

• **placeholder**? : *undefined | string*

___

### `Optional` style

• **style**? : *[StripeElementStyle](stripeelementstyle.md)*

*Inherited from [BaseElementOptions](baseelementoptions.md).[style](baseelementoptions.md#optional-style)*

Customize the appearance of an element using CSS properties passed in a [Style](https://stripe.com/docs/js/appendix/style) object,
which consists of CSS properties nested under objects for each variant.
