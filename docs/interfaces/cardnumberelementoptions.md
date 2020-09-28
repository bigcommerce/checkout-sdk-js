[@bigcommerce/checkout-sdk](../README.md) › [CardNumberElementOptions](cardnumberelementoptions.md)

# Interface: CardNumberElementOptions

## Hierarchy

  ↳ [BaseIndividualElementOptions](baseindividualelementoptions.md)

  ↳ **CardNumberElementOptions**

## Index

### Properties

* [classes](cardnumberelementoptions.md#optional-classes)
* [containerId](cardnumberelementoptions.md#containerid)
* [disabled](cardnumberelementoptions.md#optional-disabled)
* [iconStyle](cardnumberelementoptions.md#optional-iconstyle)
* [placeholder](cardnumberelementoptions.md#optional-placeholder)
* [showIcon](cardnumberelementoptions.md#optional-showicon)
* [style](cardnumberelementoptions.md#optional-style)

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

### `Optional` iconStyle

• **iconStyle**? : *[IconStyle](../enums/iconstyle.md)*

Appearance of the icon in the Element. Either `solid` or `default`

___

### `Optional` placeholder

• **placeholder**? : *undefined | string*

___

### `Optional` showIcon

• **showIcon**? : *undefined | false | true*

___

### `Optional` style

• **style**? : *[StripeElementStyle](stripeelementstyle.md)*

*Inherited from [BaseElementOptions](baseelementoptions.md).[style](baseelementoptions.md#optional-style)*

Customize the appearance of an element using CSS properties passed in a [Style](https://stripe.com/docs/js/appendix/style) object,
which consists of CSS properties nested under objects for each variant.
