[@bigcommerce/checkout-sdk](../README.md) / FastlaneShippingInitializeOptions

# Interface: FastlaneShippingInitializeOptions

A set of options that are required to initialize the shipping step of
checkout in order to support Fastlane (PayPal Commerce, BigCommerce Payments, or Braintree).

This is a unified interface that can be used across all Fastlane implementations
to simplify initialization and avoid provider-specific checks.

## Table of contents

### Properties

- [styles](FastlaneShippingInitializeOptions.md#styles)

### Methods

- [onPayPalFastlaneAddressChange](FastlaneShippingInitializeOptions.md#onpaypalfastlaneaddresschange)

## Properties

### styles

• `Optional` **styles**: [`FastlaneStylesOption`](../README.md#fastlanestylesoption)

Styling options for customizing Fastlane components

Note: the styles for all Fastlane strategies should be the same,
because they will be provided to the Fastlane library only for the first strategy initialization
no matter what strategy was initialized first

## Methods

### onPayPalFastlaneAddressChange

▸ `Optional` **onPayPalFastlaneAddressChange**(`showFastlaneAddressSelector`): `void`

A callback that shows the Fastlane popup with customer addresses
when triggered

#### Parameters

| Name | Type |
| :------ | :------ |
| `showFastlaneAddressSelector` | () => `Promise`<`undefined` \| `CustomerAddress`\> |

#### Returns

`void`
