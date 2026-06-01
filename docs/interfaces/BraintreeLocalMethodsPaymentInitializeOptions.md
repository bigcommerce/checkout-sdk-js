[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / BraintreeLocalMethodsPaymentInitializeOptions

# Interface: BraintreeLocalMethodsPaymentInitializeOptions

## Properties

### buttonText

> **buttonText**: `string`

Text that will be displayed on lpm button

***

### container

> **container**: `string`

The CSS selector of a container where the payment widget should be inserted into.

## Methods

### onError()

> **onError**(`error`): `void`

A callback for displaying error popup. This callback requires error object as parameter.

#### Parameters

##### error

`unknown`

#### Returns

`void`

***

### onRenderButton()?

> `optional` **onRenderButton**(): `void`

A callback right before render Smart Payment Button that gets called when
This callback can be used to hide the standard submit button.

#### Returns

`void`

***

### submitForm()?

> `optional` **submitForm**(): `void`

A callback for submitting payment form that gets called
when buyer approved PayPal account.

#### Returns

`void`
