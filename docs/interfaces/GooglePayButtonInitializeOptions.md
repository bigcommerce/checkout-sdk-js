[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / GooglePayButtonInitializeOptions

# Interface: GooglePayButtonInitializeOptions

## Properties

### buttonColor?

> `optional` **buttonColor?**: [`GooglePayButtonColor`](../type-aliases/GooglePayButtonColor.md)

All Google Pay payment buttons exist in two styles: dark (default) and light.
To provide contrast, use dark buttons on light backgrounds and light buttons on dark or colorful backgrounds.

***

### buttonType?

> `optional` **buttonType?**: [`GooglePayButtonType`](../type-aliases/GooglePayButtonType.md)

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
