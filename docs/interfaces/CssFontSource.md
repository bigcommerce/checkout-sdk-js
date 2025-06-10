[@bigcommerce/checkout-sdk](../README.md) / CssFontSource

# Interface: CssFontSource

This object is used to pass custom fonts when creating an [Elements](https://stripe.com/docs/js/elements_object/create) object.

## Table of contents

### Properties

- [cssSrc](CssFontSource.md#csssrc)

## Properties

### cssSrc

• **cssSrc**: `string`

A relative or absolute URL pointing to a CSS file with [@font-face](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face) definitions, for example:
`https://fonts.googleapis.com/css?family=Open+Sans`
Note that if you are using a [content security policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) (CSP),
[additional directives](https://stripe.com/docs/security#content-security-policy) may be necessary.
