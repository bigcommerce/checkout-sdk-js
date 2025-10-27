[@bigcommerce/checkout-sdk](../README.md) / BraintreeCreditCardPaymentInitializeOptions

# Interface: BraintreeCreditCardPaymentInitializeOptions

## Table of contents

### Properties

- [bannerContainerId](BraintreeCreditCardPaymentInitializeOptions.md#bannercontainerid)
- [containerId](BraintreeCreditCardPaymentInitializeOptions.md#containerid)
- [form](BraintreeCreditCardPaymentInitializeOptions.md#form)
- [threeDSecure](BraintreeCreditCardPaymentInitializeOptions.md#threedsecure)
- [unsupportedCardBrands](BraintreeCreditCardPaymentInitializeOptions.md#unsupportedcardbrands)

### Methods

- [onError](BraintreeCreditCardPaymentInitializeOptions.md#onerror)
- [onPaymentError](BraintreeCreditCardPaymentInitializeOptions.md#onpaymenterror)
- [onRenderButton](BraintreeCreditCardPaymentInitializeOptions.md#onrenderbutton)
- [submitForm](BraintreeCreditCardPaymentInitializeOptions.md#submitform)

## Properties

### bannerContainerId

• `Optional` **bannerContainerId**: `string`

The location to insert the Pay Later Messages.

___

### containerId

• `Optional` **containerId**: `string`

The CSS selector of a container where the payment widget should be inserted into.

___

### form

• `Optional` **form**: `BraintreeFormOptions`

**`alpha`**
Please note that this option is currently in an early stage of
development. Therefore the API is unstable and not ready for public
consumption.

___

### threeDSecure

• `Optional` **threeDSecure**: `BraintreeThreeDSecureOptions`

___

### unsupportedCardBrands

• `Optional` **unsupportedCardBrands**: `string`[]

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

### onError

▸ `Optional` **onError**(`error`): `void`

A callback for displaying error popup. This callback requires error object as parameter.

#### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `unknown` |

#### Returns

`void`

___

### onPaymentError

▸ `Optional` **onPaymentError**(`error`): `void`

A callback that gets called if unable to submit payment.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | `default` \| `BraintreeError` | The error object describing the failure. |

#### Returns

`void`

___

### onRenderButton

▸ `Optional` **onRenderButton**(): `void`

A callback right before render Smart Payment Button that gets called when
Smart Payment Button is eligible. This callback can be used to hide the standard submit button.

#### Returns

`void`

___

### submitForm

▸ `Optional` **submitForm**(): `void`

A callback for submitting payment form that gets called
when buyer approved PayPal account.

#### Returns

`void`
