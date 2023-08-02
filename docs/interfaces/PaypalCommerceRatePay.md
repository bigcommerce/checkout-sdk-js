[@bigcommerce/checkout-sdk](../README.md) / PaypalCommerceRatePay

# Interface: PaypalCommerceRatePay

## Table of contents

### Properties

- [container](PaypalCommerceRatePay.md#container)
- [legalTextContainer](PaypalCommerceRatePay.md#legaltextcontainer)

### Methods

- [getFieldsValues](PaypalCommerceRatePay.md#getfieldsvalues)
- [onError](PaypalCommerceRatePay.md#onerror)
- [onRenderButton](PaypalCommerceRatePay.md#onrenderbutton)

## Properties

### container

• **container**: `string`

The CSS selector of a container where the payment widget should be inserted into.

___

### legalTextContainer

• **legalTextContainer**: `string`

The CSS selector of a container where the legal text should be inserted into.

## Methods

### getFieldsValues

▸ `Optional` **getFieldsValues**(): `Object`

A callback that gets form values

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `ratepayBirthDate` | [`BirthDate`](BirthDate.md) |
| `ratepayPhoneCountryCode` | `string` |
| `ratepayPhoneNumber` | `string` |

___

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

### onRenderButton

▸ `Optional` **onRenderButton**(): `void`

A callback right before render Smart Payment Button that gets called when
Smart Payment Button is eligible. This callback can be used to hide the standard submit button.

#### Returns

`void`
