[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / CardExpiryElementOptions

# Interface: CardExpiryElementOptions

## Extends

- [`BaseIndividualElementOptions`](BaseIndividualElementOptions.md)

## Properties

### classes?

> `optional` **classes?**: [`StripeElementClasses`](StripeElementClasses.md)

Set custom class names on the container DOM element when the Stripe element is in a particular state.

#### Inherited from

[`BaseIndividualElementOptions`](BaseIndividualElementOptions.md).[`classes`](BaseIndividualElementOptions.md#classes)

***

### containerId

> **containerId**: `string`

#### Inherited from

[`BaseIndividualElementOptions`](BaseIndividualElementOptions.md).[`containerId`](BaseIndividualElementOptions.md#containerid)

***

### disabled?

> `optional` **disabled?**: `boolean`

Applies a disabled state to the Element such that user input is not accepted. Default is false.

#### Inherited from

[`BaseIndividualElementOptions`](BaseIndividualElementOptions.md).[`disabled`](BaseIndividualElementOptions.md#disabled)

***

### placeholder?

> `optional` **placeholder?**: `string`

***

### style?

> `optional` **style?**: [`StripeElementStyle`](StripeElementStyle.md)

Customize the appearance of an element using CSS properties passed in a [Style](https://stripe.com/docs/js/appendix/style) object,
which consists of CSS properties nested under objects for each variant.

#### Inherited from

[`BaseIndividualElementOptions`](BaseIndividualElementOptions.md).[`style`](BaseIndividualElementOptions.md#style)
