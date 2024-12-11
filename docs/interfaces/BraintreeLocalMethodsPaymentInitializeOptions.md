[@bigcommerce/checkout-sdk](../README.md) / BraintreeLocalMethodsPaymentInitializeOptions

# Interface: BraintreeLocalMethodsPaymentInitializeOptions

## Table of contents

### Properties

- [buttonText](BraintreeLocalMethodsPaymentInitializeOptions.md#buttontext)
- [container](BraintreeLocalMethodsPaymentInitializeOptions.md#container)

### Methods

- [onError](BraintreeLocalMethodsPaymentInitializeOptions.md#onerror)
- [onRenderButton](BraintreeLocalMethodsPaymentInitializeOptions.md#onrenderbutton)
- [submitForm](BraintreeLocalMethodsPaymentInitializeOptions.md#submitform)

## Properties

### buttonText

• **buttonText**: `string`

Text that will be displayed on lpm button

___

### container

• **container**: `string`

The CSS selector of a container where the payment widget should be inserted into.

## Methods

### onError

▸ **onError**(`error`): `void`

A callback for displaying error popup. This callback requires error object as parameter.

#### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `unknown` |

#### Returns

`void`

___

### onRenderButton

▸ `Optional` **onRenderButton**(): `void`

A callback right before render Smart Payment Button that gets called when
This callback can be used to hide the standard submit button.

#### Returns

`void`

___

### submitForm

▸ `Optional` **submitForm**(): `void`

A callback for submitting payment form that gets called
when buyer approved PayPal account.

#### Returns

`void`
