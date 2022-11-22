[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / StripeElementStyleVariant

# Interface: StripeElementStyleVariant

[<internal>](../modules/internal_.md).StripeElementStyleVariant

CSS properties supported by Stripe.js.

## Hierarchy

- [`StripeElementCSSProperties`](internal_.StripeElementCSSProperties.md)

  ↳ **`StripeElementStyleVariant`**

## Table of contents

### Properties

- [:-webkit-autofill](internal_.StripeElementStyleVariant.md#:-webkit-autofill)
- [::-ms-clear](internal_.StripeElementStyleVariant.md#::-ms-clear)
- [::placeholder](internal_.StripeElementStyleVariant.md#::placeholder)
- [::selection](internal_.StripeElementStyleVariant.md#::selection)
- [:disabled](internal_.StripeElementStyleVariant.md#:disabled)
- [:focus](internal_.StripeElementStyleVariant.md#:focus)
- [:hover](internal_.StripeElementStyleVariant.md#:hover)
- [backgroundColor](internal_.StripeElementStyleVariant.md#backgroundcolor)
- [color](internal_.StripeElementStyleVariant.md#color)
- [fontFamily](internal_.StripeElementStyleVariant.md#fontfamily)
- [fontSize](internal_.StripeElementStyleVariant.md#fontsize)
- [fontSmoothing](internal_.StripeElementStyleVariant.md#fontsmoothing)
- [fontStyle](internal_.StripeElementStyleVariant.md#fontstyle)
- [fontVariant](internal_.StripeElementStyleVariant.md#fontvariant)
- [fontWeight](internal_.StripeElementStyleVariant.md#fontweight)
- [iconColor](internal_.StripeElementStyleVariant.md#iconcolor)
- [letterSpacing](internal_.StripeElementStyleVariant.md#letterspacing)
- [lineHeight](internal_.StripeElementStyleVariant.md#lineheight)
- [padding](internal_.StripeElementStyleVariant.md#padding)
- [textAlign](internal_.StripeElementStyleVariant.md#textalign)
- [textDecoration](internal_.StripeElementStyleVariant.md#textdecoration)
- [textShadow](internal_.StripeElementStyleVariant.md#textshadow)
- [textTransform](internal_.StripeElementStyleVariant.md#texttransform)

## Properties

### :-webkit-autofill

• `Optional` **:-webkit-autofill**: [`StripeElementCSSProperties`](internal_.StripeElementCSSProperties.md)

___

### ::-ms-clear

• `Optional` **::-ms-clear**: [`StripeElementCSSProperties`](internal_.StripeElementCSSProperties.md) & { `display`: `string`  }

Available for the `cardNumber`, `cardExpiry`, and `cardCvc` elements.

___

### ::placeholder

• `Optional` **::placeholder**: [`StripeElementCSSProperties`](internal_.StripeElementCSSProperties.md)

___

### ::selection

• `Optional` **::selection**: [`StripeElementCSSProperties`](internal_.StripeElementCSSProperties.md)

___

### :disabled

• `Optional` **:disabled**: [`StripeElementCSSProperties`](internal_.StripeElementCSSProperties.md)

Available for all elements except the `paymentRequestButton` element

___

### :focus

• `Optional` **:focus**: [`StripeElementCSSProperties`](internal_.StripeElementCSSProperties.md)

___

### :hover

• `Optional` **:hover**: [`StripeElementCSSProperties`](internal_.StripeElementCSSProperties.md)

___

### backgroundColor

• `Optional` **backgroundColor**: `string`

The [background-color](https://developer.mozilla.org/en-US/docs/Web/CSS/background-color) CSS property.

This property works best with the `::selection` pseudo-class.
In other cases, consider setting the background color on the element's container instaed.

#### Inherited from

[StripeElementCSSProperties](internal_.StripeElementCSSProperties.md).[backgroundColor](internal_.StripeElementCSSProperties.md#backgroundcolor)

___

### color

• `Optional` **color**: `string`

The [color](https://developer.mozilla.org/en-US/docs/Web/CSS/color) CSS property.

#### Inherited from

[StripeElementCSSProperties](internal_.StripeElementCSSProperties.md).[color](internal_.StripeElementCSSProperties.md#color)

___

### fontFamily

• `Optional` **fontFamily**: `string`

The [font-family](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family) CSS property.

#### Inherited from

[StripeElementCSSProperties](internal_.StripeElementCSSProperties.md).[fontFamily](internal_.StripeElementCSSProperties.md#fontfamily)

___

### fontSize

• `Optional` **fontSize**: `string`

The [font-size](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size) CSS property.

#### Inherited from

[StripeElementCSSProperties](internal_.StripeElementCSSProperties.md).[fontSize](internal_.StripeElementCSSProperties.md#fontsize)

___

### fontSmoothing

• `Optional` **fontSmoothing**: `string`

The [font-smoothing](https://developer.mozilla.org/en-US/docs/Web/CSS/font-smoothing) CSS property.

#### Inherited from

[StripeElementCSSProperties](internal_.StripeElementCSSProperties.md).[fontSmoothing](internal_.StripeElementCSSProperties.md#fontsmoothing)

___

### fontStyle

• `Optional` **fontStyle**: `string`

The [font-style](https://developer.mozilla.org/en-US/docs/Web/CSS/font-style) CSS property.

#### Inherited from

[StripeElementCSSProperties](internal_.StripeElementCSSProperties.md).[fontStyle](internal_.StripeElementCSSProperties.md#fontstyle)

___

### fontVariant

• `Optional` **fontVariant**: `string`

The [font-variant](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant) CSS property.

#### Inherited from

[StripeElementCSSProperties](internal_.StripeElementCSSProperties.md).[fontVariant](internal_.StripeElementCSSProperties.md#fontvariant)

___

### fontWeight

• `Optional` **fontWeight**: `string`

The [font-weight](https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight) CSS property.

#### Inherited from

[StripeElementCSSProperties](internal_.StripeElementCSSProperties.md).[fontWeight](internal_.StripeElementCSSProperties.md#fontweight)

___

### iconColor

• `Optional` **iconColor**: `string`

A custom property, used to set the color of the icons that are rendered in an element.

#### Inherited from

[StripeElementCSSProperties](internal_.StripeElementCSSProperties.md).[iconColor](internal_.StripeElementCSSProperties.md#iconcolor)

___

### letterSpacing

• `Optional` **letterSpacing**: `string`

The [letter-spacing](https://developer.mozilla.org/en-US/docs/Web/CSS/letter-spacing) CSS property.

#### Inherited from

[StripeElementCSSProperties](internal_.StripeElementCSSProperties.md).[letterSpacing](internal_.StripeElementCSSProperties.md#letterspacing)

___

### lineHeight

• `Optional` **lineHeight**: `string`

The [line-height](https://developer.mozilla.org/en-US/docs/Web/CSS/line-height) CSS property.

To avoid cursors being rendered inconsistently across browsers, consider using a padding on the element's container instead.

#### Inherited from

[StripeElementCSSProperties](internal_.StripeElementCSSProperties.md).[lineHeight](internal_.StripeElementCSSProperties.md#lineheight)

___

### padding

• `Optional` **padding**: `string`

The [padding](https://developer.mozilla.org/en-US/docs/Web/CSS/padding) CSS property.

Available for the `idealBank` element.
Accepts integer `px` values.

#### Inherited from

[StripeElementCSSProperties](internal_.StripeElementCSSProperties.md).[padding](internal_.StripeElementCSSProperties.md#padding)

___

### textAlign

• `Optional` **textAlign**: `string`

The [text-align](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align) CSS property.

Available for the `cardNumber`, `cardExpiry`, and `cardCvc` elements.

#### Inherited from

[StripeElementCSSProperties](internal_.StripeElementCSSProperties.md).[textAlign](internal_.StripeElementCSSProperties.md#textalign)

___

### textDecoration

• `Optional` **textDecoration**: `string`

The [text-decoration](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration) CSS property.

#### Inherited from

[StripeElementCSSProperties](internal_.StripeElementCSSProperties.md).[textDecoration](internal_.StripeElementCSSProperties.md#textdecoration)

___

### textShadow

• `Optional` **textShadow**: `string`

The [text-shadow](https://developer.mozilla.org/en-US/docs/Web/CSS/text-shadow) CSS property.

#### Inherited from

[StripeElementCSSProperties](internal_.StripeElementCSSProperties.md).[textShadow](internal_.StripeElementCSSProperties.md#textshadow)

___

### textTransform

• `Optional` **textTransform**: `string`

The [text-transform](https://developer.mozilla.org/en-US/docs/Web/CSS/text-transform) CSS property.

#### Inherited from

[StripeElementCSSProperties](internal_.StripeElementCSSProperties.md).[textTransform](internal_.StripeElementCSSProperties.md#texttransform)
