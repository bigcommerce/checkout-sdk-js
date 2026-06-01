[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / BraintreeCreditCardPaymentInitializeOptions

# Interface: BraintreeCreditCardPaymentInitializeOptions

## Properties

### bannerContainerId?

> `optional` **bannerContainerId?**: `string`

The location to insert the Pay Later Messages.

***

### containerId?

> `optional` **containerId?**: `string`

The CSS selector of a container where the payment widget should be inserted into.

***

### form?

> `optional` **form?**: `BraintreeFormOptions`

**`Alpha`**

Please note that this option is currently in an early stage of
development. Therefore the API is unstable and not ready for public
consumption.

***

### threeDSecure?

> `optional` **threeDSecure?**: `BraintreeThreeDSecureOptions`

***

### unsupportedCardBrands?

> `optional` **unsupportedCardBrands?**: `string`[]

A list of card brands that are not supported by the merchant.

List of supported brands by braintree can be found here: https://braintree.github.io/braintree-web/current/module-braintree-web_hosted-fields.html#~field
search for `supportedCardBrands` property.

List of credit cards brands:
'visa',
'mastercard',
'american-express',
'diners-club',
'discover',
'jcb',
'union-pay',
'maestro',
'elo',
'mir',
'hiper',
'hipercard'

## Methods

### onError()?

> `optional` **onError**(`error`): `void`

A callback for displaying error popup. This callback requires error object as parameter.

#### Parameters

##### error

`unknown`

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

***

### onRenderButton()?

> `optional` **onRenderButton**(): `void`

A callback right before render Smart Payment Button that gets called when
Smart Payment Button is eligible. This callback can be used to hide the standard submit button.

#### Returns

`void`

***

### submitForm()?

> `optional` **submitForm**(): `void`

A callback for submitting payment form that gets called
when buyer approved PayPal account.

#### Returns

`void`
