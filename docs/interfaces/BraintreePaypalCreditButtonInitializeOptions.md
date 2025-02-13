[@bigcommerce/checkout-sdk](../README.md) / BraintreePaypalCreditButtonInitializeOptions

# Interface: BraintreePaypalCreditButtonInitializeOptions

## Table of contents

### Properties

- [buyNowInitializeOptions](BraintreePaypalCreditButtonInitializeOptions.md#buynowinitializeoptions)
- [currencyCode](BraintreePaypalCreditButtonInitializeOptions.md#currencycode)
- [shippingAddress](BraintreePaypalCreditButtonInitializeOptions.md#shippingaddress)
- [style](BraintreePaypalCreditButtonInitializeOptions.md#style)

### Methods

- [onAuthorizeError](BraintreePaypalCreditButtonInitializeOptions.md#onauthorizeerror)
- [onEligibilityFailure](BraintreePaypalCreditButtonInitializeOptions.md#oneligibilityfailure)
- [onError](BraintreePaypalCreditButtonInitializeOptions.md#onerror)
- [onPaymentError](BraintreePaypalCreditButtonInitializeOptions.md#onpaymenterror)

## Properties

### buyNowInitializeOptions

• `Optional` **buyNowInitializeOptions**: `Object`

The options that are required to initialize Buy Now functionality.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `getBuyNowCartRequestBody?` | () => `void` \| `default` |

___

### currencyCode

• `Optional` **currencyCode**: `string`

The option that used to initialize a PayPal script with provided currency code.

___

### shippingAddress

• `Optional` **shippingAddress**: ``null`` \| `default`

Address to be used for shipping.
If not provided, it will use the first saved address from the active customer.

___

### style

• `Optional` **style**: `Pick`<`PaypalStyleOptions`, ``"color"`` \| ``"height"`` \| ``"label"`` \| ``"size"`` \| ``"layout"`` \| ``"shape"`` \| ``"tagline"`` \| ``"fundingicons"``\>

A set of styling options for the checkout button.

## Methods

### onAuthorizeError

▸ `Optional` **onAuthorizeError**(`error`): `void`

A callback that gets called if unable to authorize and tokenize payment.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | `default` \| `BraintreeError` | The error object describing the failure. |

#### Returns

`void`

___

### onEligibilityFailure

▸ `Optional` **onEligibilityFailure**(): `void`

 A callback that gets called when Braintree SDK restricts to render PayPal component.

#### Returns

`void`

___

### onError

▸ `Optional` **onError**(`error`): `void`

A callback that gets called on any error instead of submit payment or authorization errors.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | `default` \| `BraintreeError` | The error object describing the failure. |

#### Returns

`void`

___

### onPaymentError

▸ `Optional` **onPaymentError**(`error`): `void`

A callback that gets called if unable to submit payment.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | `default` \| `BraintreeError` | The error object describing the failure. |

#### Returns

`void`
