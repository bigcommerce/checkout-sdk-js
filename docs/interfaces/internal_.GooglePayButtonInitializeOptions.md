[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / GooglePayButtonInitializeOptions

# Interface: GooglePayButtonInitializeOptions

[<internal>](../modules/internal_.md).GooglePayButtonInitializeOptions

## Table of contents

### Properties

- [buttonColor](internal_.GooglePayButtonInitializeOptions.md#buttoncolor)
- [buttonType](internal_.GooglePayButtonInitializeOptions.md#buttontype)

## Properties

### buttonColor

• `Optional` **buttonColor**: [`ButtonColor`](../enums/internal_.ButtonColor.md)

The color of the GooglePay button that will be inserted.
 black (default): a black button suitable for use on white or light backgrounds.
 white: a white button suitable for use on colorful backgrounds.

___

### buttonType

• `Optional` **buttonType**: [`ButtonType`](../enums/internal_.ButtonType.md)

The size of the GooglePay button that will be inserted.
 long: "Buy with Google Pay" button (default). A translated button label may appear
        if a language specified in the viewer's browser matches an available language.
 short: Google Pay payment button without the "Buy with" text.
