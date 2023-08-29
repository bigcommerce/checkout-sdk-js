[@bigcommerce/checkout-sdk](../README.md) / GooglePayButtonInitializeOptions

# Interface: GooglePayButtonInitializeOptions

## Table of contents

### Properties

- [buttonColor](GooglePayButtonInitializeOptions.md#buttoncolor)
- [buttonType](GooglePayButtonInitializeOptions.md#buttontype)
- [buyNowInitializeOptions](GooglePayButtonInitializeOptions.md#buynowinitializeoptions)

## Properties

### buttonColor

• `Optional` **buttonColor**: [`Default`](../enums/ButtonColor.md#default) \| [`Black`](../enums/ButtonColor.md#black) \| [`White`](../enums/ButtonColor.md#white)

The color of the GooglePay button that will be inserted.
 black (default): a black button suitable for use on white or light backgrounds.
 white: a white button suitable for use on colorful backgrounds.

___

### buttonType

• `Optional` **buttonType**: [`Long`](../enums/ButtonType.md#long) \| [`Short`](../enums/ButtonType.md#short)

The size of the GooglePay button that will be inserted.
 long: "Buy with Google Pay" button (default). A translated button label may appear
        if a language specified in the viewer's browser matches an available language.
 short: Google Pay payment button without the "Buy with" text.

___

### buyNowInitializeOptions

• `Optional` **buyNowInitializeOptions**: [`GooglePayBuyNowInitializeOptions`](GooglePayBuyNowInitializeOptions.md)

The options that are required to initialize Buy Now functionality.
