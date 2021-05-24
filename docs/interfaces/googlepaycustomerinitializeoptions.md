[@bigcommerce/checkout-sdk](../README.md) › [GooglePayCustomerInitializeOptions](googlepaycustomerinitializeoptions.md)

# Interface: GooglePayCustomerInitializeOptions

## Hierarchy

* **GooglePayCustomerInitializeOptions**

## Index

### Properties

* [buttonColor](googlepaycustomerinitializeoptions.md#optional-buttoncolor)
* [buttonType](googlepaycustomerinitializeoptions.md#optional-buttontype)
* [container](googlepaycustomerinitializeoptions.md#container)

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

___

###  container

• **container**: *string*

This container is used to set an event listener, provide an element ID if you want
users to be able to launch the GooglePay wallet modal by clicking on a button.
It should be an HTML element.
