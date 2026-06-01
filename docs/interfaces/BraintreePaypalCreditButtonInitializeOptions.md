[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / BraintreePaypalCreditButtonInitializeOptions

# Interface: BraintreePaypalCreditButtonInitializeOptions

## Properties

### buyNowInitializeOptions?

> `optional` **buyNowInitializeOptions?**: `object`

The options that are required to initialize Buy Now functionality.

#### getBuyNowCartRequestBody()?

> `optional` **getBuyNowCartRequestBody**(): `void` \| `BuyNowCartRequestBody`

##### Returns

`void` \| `BuyNowCartRequestBody`

***

### currencyCode?

> `optional` **currencyCode?**: `string`

The option that used to initialize a PayPal script with provided currency code.

***

### shippingAddress?

> `optional` **shippingAddress?**: `Address` \| `null`

Address to be used for shipping.
If not provided, it will use the first saved address from the active customer.

***

### style?

> `optional` **style?**: `Pick`\<`PaypalStyleOptions`, `"label"` \| `"color"` \| `"height"` \| `"layout"` \| `"shape"` \| `"size"` \| `"fundingicons"` \| `"tagline"`\>

A set of styling options for the checkout button.

## Methods

### onAuthorizeError()?

> `optional` **onAuthorizeError**(`error`): `void`

A callback that gets called if unable to authorize and tokenize payment.

#### Parameters

##### error

`StandardError` \| `BraintreeError`

The error object describing the failure.

#### Returns

`void`

***

### onEligibilityFailure()?

> `optional` **onEligibilityFailure**(): `void`

A callback that gets called when Braintree SDK restricts to render PayPal component.

#### Returns

`void`

***

### onError()?

> `optional` **onError**(`error`): `void`

A callback that gets called on any error instead of submit payment or authorization errors.

#### Parameters

##### error

`StandardError` \| `BraintreeError`

The error object describing the failure.

#### Returns

`void`

***

### onPaymentError()?

> `optional` **onPaymentError**(`error`): `void`

A callback that gets called if unable to submit payment.

#### Parameters

##### error

`StandardError` \| `BraintreeError`

The error object describing the failure.

#### Returns

`void`
