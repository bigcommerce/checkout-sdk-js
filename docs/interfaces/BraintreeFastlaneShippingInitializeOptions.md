[@bigcommerce/checkout-sdk](../README.md) / BraintreeFastlaneShippingInitializeOptions

# Interface: BraintreeFastlaneShippingInitializeOptions

A set of options that are required to initialize the shipping step of
checkout in order to support Braintree Fastlane.

## Table of contents

### Properties

- [styles](BraintreeFastlaneShippingInitializeOptions.md#styles)

### Methods

- [onPayPalFastlaneAddressChange](BraintreeFastlaneShippingInitializeOptions.md#onpaypalfastlaneaddresschange)

## Properties

### styles

• `Optional` **styles**: `BraintreeFastlaneStylesOption`

Is a stylisation options for customizing PayPal Fastlane components

Note: the styles for all Braintree Fastlane strategies should be the same,
because they will be provided to PayPal library only for the first strategy initialization
no matter what strategy was initialised first

## Methods

### onPayPalFastlaneAddressChange

▸ `Optional` **onPayPalFastlaneAddressChange**(`showBraintreeFastlaneAddressSelector`): `void`

Is a callback that shows Braintree Fastlane popup with customer addresses
when get triggered

#### Parameters

| Name | Type |
| :------ | :------ |
| `showBraintreeFastlaneAddressSelector` | () => `Promise`<`undefined` \| `CustomerAddress`\> |

#### Returns

`void`
