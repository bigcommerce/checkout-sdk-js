[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / BaseElementOptions

# Interface: BaseElementOptions

## Extended by

- [`BaseIndividualElementOptions`](BaseIndividualElementOptions.md)
- [`CardElementOptions`](CardElementOptions.md)
- [`IbanElementOptions`](IbanElementOptions.md)
- [`IdealElementOptions`](IdealElementOptions.md)

## Properties

### classes?

> `optional` **classes?**: [`StripeElementClasses`](StripeElementClasses.md)

Set custom class names on the container DOM element when the Stripe element is in a particular state.

***

### disabled?

> `optional` **disabled?**: `boolean`

Applies a disabled state to the Element such that user input is not accepted. Default is false.

***

### style?

> `optional` **style?**: [`StripeElementStyle`](StripeElementStyle.md)

Customize the appearance of an element using CSS properties passed in a [Style](https://stripe.com/docs/js/appendix/style) object,
which consists of CSS properties nested under objects for each variant.
