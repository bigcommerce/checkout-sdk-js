[@bigcommerce/checkout-sdk](../README.md) › [IdealElementOptions](idealelementoptions.md)

# Interface: IdealElementOptions

## Hierarchy

* [BaseElementOptions](baseelementoptions.md)

  ↳ **IdealElementOptions**

## Index

### Properties

* [classes](idealelementoptions.md#optional-classes)
* [disabled](idealelementoptions.md#optional-disabled)
* [hideIcon](idealelementoptions.md#optional-hideicon)
* [style](idealelementoptions.md#optional-style)
* [value](idealelementoptions.md#optional-value)

## Properties

### `Optional` classes

• **classes**? : *[StripeElementClasses](stripeelementclasses.md)*

*Inherited from [BaseElementOptions](baseelementoptions.md).[classes](baseelementoptions.md#optional-classes)*

Set custom class names on the container DOM element when the Stripe element is in a particular state.

___

### `Optional` disabled

• **disabled**? : *undefined | false | true*

*Inherited from [BaseElementOptions](baseelementoptions.md).[disabled](baseelementoptions.md#optional-disabled)*

Applies a disabled state to the Element such that user input is not accepted. Default is false.

___

### `Optional` hideIcon

• **hideIcon**? : *undefined | false | true*

Hides the icon in the Element. Default is false.

___

### `Optional` style

• **style**? : *[StripeElementStyle](stripeelementstyle.md)*

*Inherited from [BaseElementOptions](baseelementoptions.md).[style](baseelementoptions.md#optional-style)*

Customize the appearance of an element using CSS properties passed in a [Style](https://stripe.com/docs/js/appendix/style) object,
which consists of CSS properties nested under objects for each variant.

___

### `Optional` value

• **value**? : *undefined | string*
