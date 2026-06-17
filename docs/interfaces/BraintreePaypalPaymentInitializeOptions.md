[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / BraintreePaypalPaymentInitializeOptions

# Interface: BraintreePaypalPaymentInitializeOptions

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

### onInitButton()?

> `optional` **onInitButton**(`actions`): `void`

A callback for the Smart Payment Button initialization.
Used to register button actions (enable/disable) in the `checkout-sdk-js`

#### Parameters

##### actions

`InitButtonActions`

The Braintree PayPal Button actions

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

### onValidate()?

> `optional` **onValidate**(`resolve`, `reject`): `Promise`\<`void`\>

Callback for the Checkout form validation.

#### Parameters

##### resolve

() => `void`

Callback for the successful form validation

##### reject

() => `void`

Callback for the failed form validation

#### Returns

`Promise`\<`void`\>

***

### submitForm()?

> `optional` **submitForm**(): `void`

A callback for submitting payment form that gets called
when buyer approved PayPal account.

#### Returns

`void`
