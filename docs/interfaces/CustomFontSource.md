[@bigcommerce/checkout-sdk](../README.md) / CustomFontSource

# Interface: CustomFontSource

This object is used to pass custom fonts when creating an [Elements](https://stripe.com/docs/js/elements_object/create) object.

## Table of contents

### Properties

- [display](CustomFontSource.md#display)
- [family](CustomFontSource.md#family)
- [src](CustomFontSource.md#src)
- [style](CustomFontSource.md#style)
- [unicodeRange](CustomFontSource.md#unicoderange)
- [weight](CustomFontSource.md#weight)

## Properties

### display

• `Optional` **display**: `string`

A valid [font-display](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display) value.

___

### family

• **family**: `string`

The name to give the font.

___

### src

• **src**: `string`

A valid [src](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/src) value pointing to your
custom font file. This is usually (though not always) a link to a file with a .woff , .otf, or .svg suffix.

___

### style

• `Optional` **style**: `string`

One of normal, italic, oblique. Defaults to normal.

___

### unicodeRange

• `Optional` **unicodeRange**: `string`

A valid [unicode-range](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/unicode-range) value.

___

### weight

• `Optional` **weight**: `string`

A valid [font-weight](https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight). Note that this is a string, not a number.
