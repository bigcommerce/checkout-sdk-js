[@bigcommerce/checkout-sdk](../README.md) / GooglePayButtonInitializeOptions

# Interface: GooglePayButtonInitializeOptions

## Table of contents

### Properties

- [buttonColor](GooglePayButtonInitializeOptions.md#buttoncolor)
- [buttonType](GooglePayButtonInitializeOptions.md#buttontype)

## Properties

### buttonColor

• `Optional` **buttonColor**: [`GooglePayButtonColor`](../README.md#googlepaybuttoncolor)

All Google Pay payment buttons exist in two styles: dark (default) and light.
To provide contrast, use dark buttons on light backgrounds and light buttons on dark or colorful backgrounds.

___

### buttonType

• `Optional` **buttonType**: [`GooglePayButtonType`](../README.md#googlepaybuttontype)

Variant buttons:
book: The "Book with Google Pay" payment button.
buy: The "Buy with Google Pay" payment button.
checkout: The "Checkout with Google Pay" payment button.
donate: The "Donate with Google Pay" payment button.
order: The "Order with Google Pay" payment button.
pay: The "Pay with Google Pay" payment button.
plain: The Google Pay payment button without the additional text (default).
subscribe: The "Subscribe with Google Pay" payment button.

Note: "long" and "short" button types have been renamed to "buy" and "plain", but are still valid button types
for backwards compatability.
