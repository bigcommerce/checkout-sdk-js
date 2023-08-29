[@bigcommerce/checkout-sdk](../README.md) / StripeElementStyleVariant

# Interface: StripeElementStyleVariant

## Hierarchy

- [`StripeElementCSSProperties`](StripeElementCSSProperties.md)

  ↳ **`StripeElementStyleVariant`**

## Table of contents

### Properties

- [%3A-webkit-autofill](StripeElementStyleVariant.md#:-webkit-autofill)
- [%3A%3A-ms-clear](StripeElementStyleVariant.md#::-ms-clear)
- [%3A%3Aplaceholder](StripeElementStyleVariant.md#::placeholder)
- [%3A%3Aselection](StripeElementStyleVariant.md#::selection)
- [%3Adisabled](StripeElementStyleVariant.md#:disabled)
- [%3Afocus](StripeElementStyleVariant.md#:focus)
- [%3Ahover](StripeElementStyleVariant.md#:hover)
- [backgroundColor](StripeElementStyleVariant.md#backgroundcolor)
- [color](StripeElementStyleVariant.md#color)
- [fontFamily](StripeElementStyleVariant.md#fontfamily)
- [fontSize](StripeElementStyleVariant.md#fontsize)
- [fontSmoothing](StripeElementStyleVariant.md#fontsmoothing)
- [fontStyle](StripeElementStyleVariant.md#fontstyle)
- [fontVariant](StripeElementStyleVariant.md#fontvariant)
- [fontWeight](StripeElementStyleVariant.md#fontweight)
- [iconColor](StripeElementStyleVariant.md#iconcolor)
- [letterSpacing](StripeElementStyleVariant.md#letterspacing)
- [lineHeight](StripeElementStyleVariant.md#lineheight)
- [padding](StripeElementStyleVariant.md#padding)
- [textAlign](StripeElementStyleVariant.md#textalign)
- [textDecoration](StripeElementStyleVariant.md#textdecoration)
- [textShadow](StripeElementStyleVariant.md#textshadow)
- [textTransform](StripeElementStyleVariant.md#texttransform)

## Properties

### :-webkit-autofill

• `Optional` **:-webkit-autofill**: [`StripeElementCSSProperties`](StripeElementCSSProperties.md)

___

### ::-ms-clear

• `Optional` **::-ms-clear**: [`StripeElementCSSProperties`](StripeElementCSSProperties.md) & { `display`: `string`  }

Available for the `cardNumber`, `cardExpiry`, and `cardCvc` elements.

___

### ::placeholder

• `Optional` **::placeholder**: [`StripeElementCSSProperties`](StripeElementCSSProperties.md)

___

### ::selection

• `Optional` **::selection**: [`StripeElementCSSProperties`](StripeElementCSSProperties.md)

___

### :disabled

• `Optional` **:disabled**: [`StripeElementCSSProperties`](StripeElementCSSProperties.md)

Available for all elements except the `paymentRequestButton` element

___

### :focus

• `Optional` **:focus**: [`StripeElementCSSProperties`](StripeElementCSSProperties.md)

___

### :hover

• `Optional` **:hover**: [`StripeElementCSSProperties`](StripeElementCSSProperties.md)

___

### backgroundColor

• `Optional` **backgroundColor**: `string`

The [background-color](https://developer.mozilla.org/en-US/docs/Web/CSS/background-color) CSS property.

This property works best with the `::selection` pseudo-class.
In other cases, consider setting the background color on the element's container instaed.

#### Inherited from

[StripeElementCSSProperties](StripeElementCSSProperties.md).[backgroundColor](StripeElementCSSProperties.md#backgroundcolor)

___

### color

• `Optional` **color**: `string`

The [color](https://developer.mozilla.org/en-US/docs/Web/CSS/color) CSS property.

#### Inherited from

[StripeElementCSSProperties](StripeElementCSSProperties.md).[color](StripeElementCSSProperties.md#color)

___

### fontFamily

• `Optional` **fontFamily**: `string`

The [font-family](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family) CSS property.

#### Inherited from

[StripeElementCSSProperties](StripeElementCSSProperties.md).[fontFamily](StripeElementCSSProperties.md#fontfamily)

___

### fontSize

• `Optional` **fontSize**: `string`

The [font-size](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size) CSS property.

#### Inherited from

[StripeElementCSSProperties](StripeElementCSSProperties.md).[fontSize](StripeElementCSSProperties.md#fontsize)

___

### fontSmoothing

• `Optional` **fontSmoothing**: `string`

The [font-smoothing](https://developer.mozilla.org/en-US/docs/Web/CSS/font-smoothing) CSS property.

#### Inherited from

[StripeElementCSSProperties](StripeElementCSSProperties.md).[fontSmoothing](StripeElementCSSProperties.md#fontsmoothing)

___

### fontStyle

• `Optional` **fontStyle**: `string`

The [font-style](https://developer.mozilla.org/en-US/docs/Web/CSS/font-style) CSS property.

#### Inherited from

[StripeElementCSSProperties](StripeElementCSSProperties.md).[fontStyle](StripeElementCSSProperties.md#fontstyle)

___

### fontVariant

• `Optional` **fontVariant**: `string`

The [font-variant](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant) CSS property.

#### Inherited from

[StripeElementCSSProperties](StripeElementCSSProperties.md).[fontVariant](StripeElementCSSProperties.md#fontvariant)

___

### fontWeight

• `Optional` **fontWeight**: `string`

The [font-weight](https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight) CSS property.

#### Inherited from

[StripeElementCSSProperties](StripeElementCSSProperties.md).[fontWeight](StripeElementCSSProperties.md#fontweight)

___

### iconColor

• `Optional` **iconColor**: `string`

A custom property, used to set the color of the icons that are rendered in an element.

#### Inherited from

[StripeElementCSSProperties](StripeElementCSSProperties.md).[iconColor](StripeElementCSSProperties.md#iconcolor)

___

### letterSpacing

• `Optional` **letterSpacing**: `string`

The [letter-spacing](https://developer.mozilla.org/en-US/docs/Web/CSS/letter-spacing) CSS property.

#### Inherited from

[StripeElementCSSProperties](StripeElementCSSProperties.md).[letterSpacing](StripeElementCSSProperties.md#letterspacing)

___

### lineHeight

• `Optional` **lineHeight**: `string`

The [line-height](https://developer.mozilla.org/en-US/docs/Web/CSS/line-height) CSS property.

To avoid cursors being rendered inconsistently across browsers, consider using a padding on the element's container instead.

#### Inherited from

[StripeElementCSSProperties](StripeElementCSSProperties.md).[lineHeight](StripeElementCSSProperties.md#lineheight)

___

### padding

• `Optional` **padding**: `string`

The [padding](https://developer.mozilla.org/en-US/docs/Web/CSS/padding) CSS property.

Available for the `idealBank` element.
Accepts integer `px` values.

#### Inherited from

[StripeElementCSSProperties](StripeElementCSSProperties.md).[padding](StripeElementCSSProperties.md#padding)

___

### textAlign

• `Optional` **textAlign**: `string`

The [text-align](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align) CSS property.

Available for the `cardNumber`, `cardExpiry`, and `cardCvc` elements.

#### Inherited from

[StripeElementCSSProperties](StripeElementCSSProperties.md).[textAlign](StripeElementCSSProperties.md#textalign)

___

### textDecoration

• `Optional` **textDecoration**: `string`

The [text-decoration](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration) CSS property.

#### Inherited from

[StripeElementCSSProperties](StripeElementCSSProperties.md).[textDecoration](StripeElementCSSProperties.md#textdecoration)

___

### textShadow

• `Optional` **textShadow**: `string`

The [text-shadow](https://developer.mozilla.org/en-US/docs/Web/CSS/text-shadow) CSS property.

#### Inherited from

[StripeElementCSSProperties](StripeElementCSSProperties.md).[textShadow](StripeElementCSSProperties.md#textshadow)

___

### textTransform

• `Optional` **textTransform**: `string`

The [text-transform](https://developer.mozilla.org/en-US/docs/Web/CSS/text-transform) CSS property.

#### Inherited from

[StripeElementCSSProperties](StripeElementCSSProperties.md).[textTransform](StripeElementCSSProperties.md#texttransform)
