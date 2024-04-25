[@bigcommerce/checkout-sdk](../README.md) / PayPalCommerceFastlaneShippingInitializeOptions

# Interface: PayPalCommerceFastlaneShippingInitializeOptions

A set of options that are required to initialize the shipping step of
checkout in order to support PayPal Commerce Fastlane.

## Table of contents

### Properties

- [styles](PayPalCommerceFastlaneShippingInitializeOptions.md#styles)

### Methods

- [onPayPalFastlaneAddressChange](PayPalCommerceFastlaneShippingInitializeOptions.md#onpaypalfastlaneaddresschange)

## Properties

### styles

• `Optional` **styles**: `PayPalFastlaneStylesOption`

Is a stylisation options for customizing PayPal Fastlane components

Note: the styles for all PayPal Commerce Fastlane strategies should be the same,
because they will be provided to PayPal library only for the first strategy initialization
no matter what strategy was initialised first

## Methods

### onPayPalFastlaneAddressChange

▸ `Optional` **onPayPalFastlaneAddressChange**(`showPayPalFastlaneAddressSelector`): `void`

Is a callback that shows PayPal Fastlane popup with customer addresses
when get triggered

#### Parameters

| Name | Type |
| :------ | :------ |
| `showPayPalFastlaneAddressSelector` | () => `Promise`<`undefined` \| `CustomerAddress`\> |

#### Returns

`void`
