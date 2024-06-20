[@bigcommerce/checkout-sdk](../README.md) / GooglePayCustomerInitializeOptions

# Interface: GooglePayCustomerInitializeOptions

## Table of contents

### Properties

- [buttonColor](GooglePayCustomerInitializeOptions.md#buttoncolor)
- [buttonType](GooglePayCustomerInitializeOptions.md#buttontype)
- [container](GooglePayCustomerInitializeOptions.md#container)

### Methods

- [onClick](GooglePayCustomerInitializeOptions.md#onclick)
- [onError](GooglePayCustomerInitializeOptions.md#onerror)

## Properties

### buttonColor

• `Optional` **buttonColor**: ``"default"`` \| ``"black"`` \| ``"white"``

All Google Pay payment buttons exist in two styles: dark (default) and light.
To provide contrast, use dark buttons on light backgrounds and light buttons on dark or colorful backgrounds.

___

### buttonType

• `Optional` **buttonType**: ``"book"`` \| ``"buy"`` \| ``"checkout"`` \| ``"donate"`` \| ``"order"`` \| ``"pay"`` \| ``"plain"`` \| ``"subscribe"`` \| ``"long"`` \| ``"short"``

Variant buttons:
book: The "Book with Google Pay" payment button.
buy: The "Buy with Google Pay" payment button.
checkout: The "Checkout with Google Pay" payment button.
donate: The "Donate with Google Pay" payment button.
order: The "Order with Google Pay" payment button.
pay: The "Pay with Google Pay" payment button.
plain: The Google Pay payment button without the additional text (default).
subscribe: The "Subscribe with Google Pay" payment button.

Note: "long" and "short" button types have been renamed to "buy" and "plain", but are still valid button types
for backwards compatability.

___

### container

• **container**: `string`

This container is used to set an event listener, provide an element ID if you want users to be able to launch
the GooglePay wallet modal by clicking on a button. It should be an HTML element.

## Methods

### onClick

▸ `Optional` **onClick**(): `void`

Callback that get called on wallet button click

#### Returns

`void`

___

### onError

▸ `Optional` **onError**(`error`): `void`

A callback that gets called when GooglePay fails to initialize or
selects a payment option.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | `Error` | The error object describing the failure. |

#### Returns

`void`
