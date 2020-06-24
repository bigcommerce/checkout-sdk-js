[@bigcommerce/checkout-sdk](../README.md) › [GooglePayButtonInitializeOptions](googlepaybuttoninitializeoptions.md)

# Interface: GooglePayButtonInitializeOptions

## Hierarchy

* **GooglePayButtonInitializeOptions**

## Index

### Properties

* [buttonColor](googlepaybuttoninitializeoptions.md#optional-buttoncolor)
* [buttonType](googlepaybuttoninitializeoptions.md#optional-buttontype)

## Properties

### `Optional` buttonColor

• **buttonColor**? : *[ButtonColor](../enums/buttoncolor.md)*

The color of the GooglePay button that will be inserted.
 black (default): a black button suitable for use on white or light backgrounds.
 white: a white button suitable for use on colorful backgrounds.

___

### `Optional` buttonType

• **buttonType**? : *[ButtonType](../enums/buttontype.md)*

The size of the GooglePay button that will be inserted.
 long: "Buy with Google Pay" button (default). A translated button label may appear
        if a language specified in the viewer's browser matches an available language.
 short: Google Pay payment button without the "Buy with" text.
