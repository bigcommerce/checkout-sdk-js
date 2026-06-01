[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / StripeUPECustomerInitializeOptions

# Interface: StripeUPECustomerInitializeOptions

## Properties

### container

> **container**: `string`

The ID of a container which the stripe iframe should be inserted.

***

### gatewayId

> **gatewayId**: `string`

The identifier of the payment provider providing the payment method. This
option is only required if the provider offers multiple payment options.
i.e.: Stripeupe and Klarna.

***

### methodId

> **methodId**: `string`

The identifier of the payment method.

## Methods

### getStyles()?

> `optional` **getStyles**(): \{\[`key`: `string`\]: `string`; \} \| `undefined`

get styles from store theme

#### Returns

\{\[`key`: `string`\]: `string`; \} \| `undefined`

***

### isLoading()

> **isLoading**(`mounted`): `void`

A callback that gets called when Stripe Link Authentication Element is Loaded.

#### Parameters

##### mounted

`boolean`

#### Returns

`void`

***

### onEmailChange()

> **onEmailChange**(`authenticated`, `email`): `void`

A callback that gets called whenever the Stripe Link Authentication Element's value changes.

#### Parameters

##### authenticated

`boolean`

if the email is authenticated on Stripe.

##### email

`string`

The new value of the email.

#### Returns

`void`
