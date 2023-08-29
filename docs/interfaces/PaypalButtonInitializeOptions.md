[@bigcommerce/checkout-sdk](../README.md) / PaypalButtonInitializeOptions

# Interface: PaypalButtonInitializeOptions

## Table of contents

### Properties

- [allowCredit](PaypalButtonInitializeOptions.md#allowcredit)
- [clientId](PaypalButtonInitializeOptions.md#clientid)
- [style](PaypalButtonInitializeOptions.md#style)

### Methods

- [onAuthorizeError](PaypalButtonInitializeOptions.md#onauthorizeerror)
- [onPaymentError](PaypalButtonInitializeOptions.md#onpaymenterror)

## Properties

### allowCredit

• `Optional` **allowCredit**: `boolean`

Whether or not to show a credit button.

___

### clientId

• **clientId**: `string`

The Client ID of the Paypal App

___

### style

• `Optional` **style**: `Pick`<[`PaypalStyleOptions`](PaypalStyleOptions.md), ``"color"`` \| ``"layout"`` \| ``"size"`` \| ``"label"`` \| ``"shape"`` \| ``"tagline"`` \| ``"fundingicons"``\>

A set of styling options for the checkout button.

## Methods

### onAuthorizeError

▸ `Optional` **onAuthorizeError**(`error`): `void`

A callback that gets called if unable to authorize and tokenize payment.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | [`StandardError`](../classes/StandardError.md) | The error object describing the failure. |

#### Returns

`void`

___

### onPaymentError

▸ `Optional` **onPaymentError**(`error`): `void`

A callback that gets called if unable to submit payment.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | [`StandardError`](../classes/StandardError.md) | The error object describing the failure. |

#### Returns

`void`
