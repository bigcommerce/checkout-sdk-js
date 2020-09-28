[@bigcommerce/checkout-sdk](../README.md) › [CardElementOptions](cardelementoptions.md)

# Interface: CardElementOptions

## Hierarchy

* [BaseElementOptions](baseelementoptions.md)

  ↳ **CardElementOptions**

## Index

### Properties

* [classes](cardelementoptions.md#optional-classes)
* [disabled](cardelementoptions.md#optional-disabled)
* [hideIcon](cardelementoptions.md#optional-hideicon)
* [hidePostalCode](cardelementoptions.md#optional-hidepostalcode)
* [iconStyle](cardelementoptions.md#optional-iconstyle)
* [style](cardelementoptions.md#optional-style)
* [value](cardelementoptions.md#optional-value)

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

___

### `Optional` hidePostalCode

• **hidePostalCode**? : *undefined | false | true*

Hide the postal code field. Default is false. If you are already collecting a
full billing address or postal code elsewhere, set this to true.

___

### `Optional` iconStyle

• **iconStyle**? : *[IconStyle](../enums/iconstyle.md)*

Appearance of the icon in the Element.

___

### `Optional` style

• **style**? : *[StripeElementStyle](stripeelementstyle.md)*

*Inherited from [BaseElementOptions](baseelementoptions.md).[style](baseelementoptions.md#optional-style)*

Customize the appearance of an element using CSS properties passed in a [Style](https://stripe.com/docs/js/appendix/style) object,
which consists of CSS properties nested under objects for each variant.

___

### `Optional` value

• **value**? : *undefined | string*

A pre-filled set of values to include in the input (e.g., {postalCode: '94110'}).
Note that sensitive card information (card number, CVC, and expiration date)
cannot be pre-filled
