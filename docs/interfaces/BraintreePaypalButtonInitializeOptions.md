[@bigcommerce/checkout-sdk](../README.md) / BraintreePaypalButtonInitializeOptions

# Interface: BraintreePaypalButtonInitializeOptions

## Table of contents

### Properties

- [buyNowInitializeOptions](BraintreePaypalButtonInitializeOptions.md#buynowinitializeoptions)
- [currencyCode](BraintreePaypalButtonInitializeOptions.md#currencycode)
- [messagingContainerId](BraintreePaypalButtonInitializeOptions.md#messagingcontainerid)
- [shippingAddress](BraintreePaypalButtonInitializeOptions.md#shippingaddress)
- [style](BraintreePaypalButtonInitializeOptions.md#style)

### Methods

- [onAuthorizeError](BraintreePaypalButtonInitializeOptions.md#onauthorizeerror)
- [onError](BraintreePaypalButtonInitializeOptions.md#onerror)
- [onPaymentError](BraintreePaypalButtonInitializeOptions.md#onpaymenterror)

## Properties

### buyNowInitializeOptions

• `Optional` **buyNowInitializeOptions**: `Object`

The options that are required to initialize Buy Now functionality.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `getBuyNowCartRequestBody?` | () => `void` \| [`BuyNowCartRequestBody`](BuyNowCartRequestBody.md) |

___

### currencyCode

• `Optional` **currencyCode**: `string`

The option that used to initialize a PayPal script with provided currency code.

___

### messagingContainerId

• `Optional` **messagingContainerId**: `string`

The ID of a container which the messaging should be inserted.

___

### shippingAddress

• `Optional` **shippingAddress**: ``null`` \| [`Address`](Address.md)

Address to be used for shipping.
If not provided, it will use the first saved address from the active customer.

___

### style

• `Optional` **style**: `Pick`<[`PaypalStyleOptions`](PaypalStyleOptions.md), ``"color"`` \| ``"layout"`` \| ``"size"`` \| ``"label"`` \| ``"shape"`` \| ``"tagline"`` \| ``"fundingicons"`` \| ``"height"``\>

A set of styling options for the checkout button.

## Methods

### onAuthorizeError

▸ `Optional` **onAuthorizeError**(`error`): `void`

A callback that gets called if unable to authorize and tokenize payment.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | [`BraintreeError`](BraintreeError.md) \| [`StandardError`](../classes/StandardError.md) | The error object describing the failure. |

#### Returns

`void`

___

### onError

▸ `Optional` **onError**(`error`): `void`

A callback that gets called on any error instead of submit payment or authorization errors.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | [`BraintreeError`](BraintreeError.md) \| [`StandardError`](../classes/StandardError.md) | The error object describing the failure. |

#### Returns

`void`

___

### onPaymentError

▸ `Optional` **onPaymentError**(`error`): `void`

A callback that gets called if unable to submit payment.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | [`BraintreeError`](BraintreeError.md) \| [`StandardError`](../classes/StandardError.md) | The error object describing the failure. |

#### Returns

`void`
