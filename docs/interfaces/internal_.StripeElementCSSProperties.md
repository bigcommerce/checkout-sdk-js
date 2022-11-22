[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / StripeElementCSSProperties

# Interface: StripeElementCSSProperties

[<internal>](../modules/internal_.md).StripeElementCSSProperties

CSS properties supported by Stripe.js.

## Hierarchy

- **`StripeElementCSSProperties`**

  ↳ [`StripeElementStyleVariant`](internal_.StripeElementStyleVariant.md)

## Table of contents

### Properties

- [backgroundColor](internal_.StripeElementCSSProperties.md#backgroundcolor)
- [color](internal_.StripeElementCSSProperties.md#color)
- [fontFamily](internal_.StripeElementCSSProperties.md#fontfamily)
- [fontSize](internal_.StripeElementCSSProperties.md#fontsize)
- [fontSmoothing](internal_.StripeElementCSSProperties.md#fontsmoothing)
- [fontStyle](internal_.StripeElementCSSProperties.md#fontstyle)
- [fontVariant](internal_.StripeElementCSSProperties.md#fontvariant)
- [fontWeight](internal_.StripeElementCSSProperties.md#fontweight)
- [iconColor](internal_.StripeElementCSSProperties.md#iconcolor)
- [letterSpacing](internal_.StripeElementCSSProperties.md#letterspacing)
- [lineHeight](internal_.StripeElementCSSProperties.md#lineheight)
- [padding](internal_.StripeElementCSSProperties.md#padding)
- [textAlign](internal_.StripeElementCSSProperties.md#textalign)
- [textDecoration](internal_.StripeElementCSSProperties.md#textdecoration)
- [textShadow](internal_.StripeElementCSSProperties.md#textshadow)
- [textTransform](internal_.StripeElementCSSProperties.md#texttransform)

## Properties

### backgroundColor

• `Optional` **backgroundColor**: `string`

The [background-color](https://developer.mozilla.org/en-US/docs/Web/CSS/background-color) CSS property.

This property works best with the `::selection` pseudo-class.
In other cases, consider setting the background color on the element's container instaed.

___

### color

• `Optional` **color**: `string`

The [color](https://developer.mozilla.org/en-US/docs/Web/CSS/color) CSS property.

___

### fontFamily

• `Optional` **fontFamily**: `string`

The [font-family](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family) CSS property.

___

### fontSize

• `Optional` **fontSize**: `string`

The [font-size](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size) CSS property.

___

### fontSmoothing

• `Optional` **fontSmoothing**: `string`

The [font-smoothing](https://developer.mozilla.org/en-US/docs/Web/CSS/font-smoothing) CSS property.

___

### fontStyle

• `Optional` **fontStyle**: `string`

The [font-style](https://developer.mozilla.org/en-US/docs/Web/CSS/font-style) CSS property.

___

### fontVariant

• `Optional` **fontVariant**: `string`

The [font-variant](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant) CSS property.

___

### fontWeight

• `Optional` **fontWeight**: `string`

The [font-weight](https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight) CSS property.

___

### iconColor

• `Optional` **iconColor**: `string`

A custom property, used to set the color of the icons that are rendered in an element.

___

### letterSpacing

• `Optional` **letterSpacing**: `string`

The [letter-spacing](https://developer.mozilla.org/en-US/docs/Web/CSS/letter-spacing) CSS property.

___

### lineHeight

• `Optional` **lineHeight**: `string`

The [line-height](https://developer.mozilla.org/en-US/docs/Web/CSS/line-height) CSS property.

To avoid cursors being rendered inconsistently across browsers, consider using a padding on the element's container instead.

___

### padding

• `Optional` **padding**: `string`

The [padding](https://developer.mozilla.org/en-US/docs/Web/CSS/padding) CSS property.

Available for the `idealBank` element.
Accepts integer `px` values.

___

### textAlign

• `Optional` **textAlign**: `string`

The [text-align](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align) CSS property.

Available for the `cardNumber`, `cardExpiry`, and `cardCvc` elements.

___

### textDecoration

• `Optional` **textDecoration**: `string`

The [text-decoration](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration) CSS property.

___

### textShadow

• `Optional` **textShadow**: `string`

The [text-shadow](https://developer.mozilla.org/en-US/docs/Web/CSS/text-shadow) CSS property.

___

### textTransform

• `Optional` **textTransform**: `string`

The [text-transform](https://developer.mozilla.org/en-US/docs/Web/CSS/text-transform) CSS property.
