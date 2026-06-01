[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / PaypalCommerceRatePay

# Interface: PaypalCommerceRatePay

## Properties

### container

> **container**: `string`

The CSS selector of a container where the payment widget should be inserted into.

***

### legalTextContainer

> **legalTextContainer**: `string`

The CSS selector of a container where the legal text should be inserted into.

***

### loadingContainerId

> **loadingContainerId**: `string`

The CSS selector of a container where loading indicator should be rendered

## Methods

### getFieldsValues()?

> `optional` **getFieldsValues**(): `object`

A callback that gets form values

#### Returns

`object`

##### ratepayBirthDate

> **ratepayBirthDate**: [`BirthDate_2`](BirthDate_2.md)

##### ratepayPhoneCountryCode

> **ratepayPhoneCountryCode**: `string`

##### ratepayPhoneNumber

> **ratepayPhoneNumber**: `string`

***

### onError()?

> `optional` **onError**(`error`): `void`

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
Smart Payment Button is eligible. This callback can be used to hide the standard submit button.

#### Returns

`void`
