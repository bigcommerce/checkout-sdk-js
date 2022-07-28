[@bigcommerce/checkout-sdk](../README.md) / GooglePayCustomerInitializeOptions

# Interface: GooglePayCustomerInitializeOptions

## Table of contents

### Properties

- [buttonColor](GooglePayCustomerInitializeOptions.md#buttoncolor)
- [buttonType](GooglePayCustomerInitializeOptions.md#buttontype)
- [container](GooglePayCustomerInitializeOptions.md#container)

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

### container

• **container**: `string`

This container is used to set an event listener, provide an element ID if you want
users to be able to launch the GooglePay wallet modal by clicking on a button.
It should be an HTML element.
