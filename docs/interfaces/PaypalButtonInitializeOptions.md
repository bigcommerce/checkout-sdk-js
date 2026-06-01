[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / PaypalButtonInitializeOptions

# Interface: PaypalButtonInitializeOptions

## Properties

### allowCredit?

> `optional` **allowCredit?**: `boolean`

Whether or not to show a credit button.

***

### clientId

> **clientId**: `string`

The Client ID of the Paypal App

***

### style?

> `optional` **style?**: `Pick`\<[`PaypalStyleOptions`](PaypalStyleOptions.md), `"label"` \| `"color"` \| `"layout"` \| `"shape"` \| `"size"` \| `"fundingicons"` \| `"tagline"`\>

A set of styling options for the checkout button.

## Methods

### onAuthorizeError()?

> `optional` **onAuthorizeError**(`error`): `void`

A callback that gets called if unable to authorize and tokenize payment.

#### Parameters

##### error

[`StandardError`](../classes/StandardError.md)

The error object describing the failure.

#### Returns

`void`

***

### onPaymentError()?

> `optional` **onPaymentError**(`error`): `void`

A callback that gets called if unable to submit payment.

#### Parameters

##### error

[`StandardError`](../classes/StandardError.md)

The error object describing the failure.

#### Returns

`void`
