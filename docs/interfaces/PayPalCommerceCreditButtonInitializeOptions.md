[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / PayPalCommerceCreditButtonInitializeOptions

# Interface: PayPalCommerceCreditButtonInitializeOptions

## Properties

### buyNowInitializeOptions?

> `optional` **buyNowInitializeOptions?**: [`PayPalBuyNowInitializeOptions_2`](PayPalBuyNowInitializeOptions_2.md)

The options that are required to initialize Buy Now functionality.

***

### currencyCode?

> `optional` **currencyCode?**: `string`

The option that used to initialize a PayPal script with provided currency code.

***

### style?

> `optional` **style?**: [`PayPalButtonStyleOptions_2`](PayPalButtonStyleOptions_2.md)

A set of styling options for the checkout button.

## Methods

### onComplete()?

> `optional` **onComplete**(): `void`

A callback that gets called when payment complete on paypal side.

#### Returns

`void`

***

### onEligibilityFailure()?

> `optional` **onEligibilityFailure**(): `void`

A callback that gets called when PayPal SDK restricts to render PayPal component.

#### Returns

`void`
