[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / PaypalButtonInitializeOptions

# Interface: PaypalButtonInitializeOptions

[<internal>](../modules/internal_.md).PaypalButtonInitializeOptions

## Table of contents

### Properties

- [allowCredit](internal_.PaypalButtonInitializeOptions.md#allowcredit)
- [clientId](internal_.PaypalButtonInitializeOptions.md#clientid)
- [style](internal_.PaypalButtonInitializeOptions.md#style)

### Methods

- [onAuthorizeError](internal_.PaypalButtonInitializeOptions.md#onauthorizeerror)
- [onPaymentError](internal_.PaypalButtonInitializeOptions.md#onpaymenterror)

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

• `Optional` **style**: `Pick`<[`PaypalButtonStyleOptions`](internal_.PaypalButtonStyleOptions.md), ``"label"`` \| ``"size"`` \| ``"color"`` \| ``"layout"`` \| ``"shape"`` \| ``"tagline"`` \| ``"fundingicons"``\>

A set of styling options for the checkout button.

## Methods

### onAuthorizeError

▸ `Optional` **onAuthorizeError**(`error`): `void`

A callback that gets called if unable to authorize and tokenize payment.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | [`StandardError`](../classes/internal_.StandardError.md) | The error object describing the failure. |

#### Returns

`void`

___

### onPaymentError

▸ `Optional` **onPaymentError**(`error`): `void`

A callback that gets called if unable to submit payment.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | [`StandardError`](../classes/internal_.StandardError.md) | The error object describing the failure. |

#### Returns

`void`
