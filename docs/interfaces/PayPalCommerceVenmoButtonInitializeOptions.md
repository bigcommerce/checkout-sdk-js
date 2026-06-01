[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / PayPalCommerceVenmoButtonInitializeOptions

# Interface: PayPalCommerceVenmoButtonInitializeOptions

## Properties

### buyNowInitializeOptions?

> `optional` **buyNowInitializeOptions?**: [`PayPalBuyNowInitializeOptions_2`](PayPalBuyNowInitializeOptions_2.md)

The options that required to initialize Buy Now functionality.

***

### currencyCode?

> `optional` **currencyCode?**: `string`

The option that used to initialize a PayPal script with provided currency code.

***

### style?

> `optional` **style?**: [`PayPalButtonStyleOptions_2`](PayPalButtonStyleOptions_2.md)

A set of styling options for the checkout button.

## Methods

### onEligibilityFailure()?

> `optional` **onEligibilityFailure**(): `void`

A callback that gets called when PayPal SDK restricts to render PayPal component.

#### Returns

`void`
