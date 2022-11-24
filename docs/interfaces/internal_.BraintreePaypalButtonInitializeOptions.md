[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / BraintreePaypalButtonInitializeOptions

# Interface: BraintreePaypalButtonInitializeOptions

[<internal>](../modules/internal_.md).BraintreePaypalButtonInitializeOptions

## Table of contents

### Properties

- [buyNowInitializeOptions](internal_.BraintreePaypalButtonInitializeOptions.md#buynowinitializeoptions)
- [currencyCode](internal_.BraintreePaypalButtonInitializeOptions.md#currencycode)
- [messagingContainerId](internal_.BraintreePaypalButtonInitializeOptions.md#messagingcontainerid)
- [shippingAddress](internal_.BraintreePaypalButtonInitializeOptions.md#shippingaddress)
- [style](internal_.BraintreePaypalButtonInitializeOptions.md#style)

### Methods

- [onAuthorizeError](internal_.BraintreePaypalButtonInitializeOptions.md#onauthorizeerror)
- [onError](internal_.BraintreePaypalButtonInitializeOptions.md#onerror)
- [onPaymentError](internal_.BraintreePaypalButtonInitializeOptions.md#onpaymenterror)

## Properties

### buyNowInitializeOptions

• `Optional` **buyNowInitializeOptions**: `Object`

The options that are required to initialize Buy Now functionality.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `getBuyNowCartRequestBody?` | () => `void` \| [`BuyNowCartRequestBody`](internal_.BuyNowCartRequestBody.md) |

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

• `Optional` **shippingAddress**: ``null`` \| [`Address`](internal_.Address.md)

Address to be used for shipping.
If not provided, it will use the first saved address from the active customer.

___

### style

• `Optional` **style**: `Pick`<[`PaypalButtonStyleOptions`](internal_.PaypalButtonStyleOptions.md), ``"label"`` \| ``"size"`` \| ``"color"`` \| ``"height"`` \| ``"layout"`` \| ``"shape"`` \| ``"tagline"`` \| ``"fundingicons"``\>

A set of styling options for the checkout button.

## Methods

### onAuthorizeError

▸ `Optional` **onAuthorizeError**(`error`): `void`

A callback that gets called if unable to authorize and tokenize payment.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | [`BraintreeError`](internal_.BraintreeError.md) \| [`StandardError`](../classes/internal_.StandardError.md) | The error object describing the failure. |

#### Returns

`void`

___

### onError

▸ `Optional` **onError**(`error`): `void`

A callback that gets called on any error instead of submit payment or authorization errors.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | [`BraintreeError`](internal_.BraintreeError.md) \| [`StandardError`](../classes/internal_.StandardError.md) | The error object describing the failure. |

#### Returns

`void`

___

### onPaymentError

▸ `Optional` **onPaymentError**(`error`): `void`

A callback that gets called if unable to submit payment.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | [`BraintreeError`](internal_.BraintreeError.md) \| [`StandardError`](../classes/internal_.StandardError.md) | The error object describing the failure. |

#### Returns

`void`
