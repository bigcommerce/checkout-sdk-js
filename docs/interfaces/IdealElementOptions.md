[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / IdealElementOptions

# Interface: IdealElementOptions

## Extends

- [`BaseElementOptions`](BaseElementOptions.md)

## Properties

### classes?

> `optional` **classes?**: [`StripeElementClasses`](StripeElementClasses.md)

Set custom class names on the container DOM element when the Stripe element is in a particular state.

#### Inherited from

[`BaseElementOptions`](BaseElementOptions.md).[`classes`](BaseElementOptions.md#classes)

***

### disabled?

> `optional` **disabled?**: `boolean`

Applies a disabled state to the Element such that user input is not accepted. Default is false.

#### Inherited from

[`BaseElementOptions`](BaseElementOptions.md).[`disabled`](BaseElementOptions.md#disabled)

***

### hideIcon?

> `optional` **hideIcon?**: `boolean`

Hides the icon in the Element. Default is false.

***

### style?

> `optional` **style?**: [`StripeElementStyle`](StripeElementStyle.md)

Customize the appearance of an element using CSS properties passed in a [Style](https://stripe.com/docs/js/appendix/style) object,
which consists of CSS properties nested under objects for each variant.

#### Inherited from

[`BaseElementOptions`](BaseElementOptions.md).[`style`](BaseElementOptions.md#style)

***

### value?

> `optional` **value?**: `string`
