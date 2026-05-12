[@bigcommerce/checkout-sdk](../README.md) / BraintreeFastlaneShippingInitializeOptions

# Interface: BraintreeFastlaneShippingInitializeOptions

A set of options that are required to initialize the shipping step of
checkout in order to support Braintree Fastlane.

## Table of contents

### Properties

- [onPayPalFastlaneAddressChange](BraintreeFastlaneShippingInitializeOptions.md#onpaypalfastlaneaddresschange)
- [styles](BraintreeFastlaneShippingInitializeOptions.md#styles)

## Properties

### onPayPalFastlaneAddressChange

• `Optional` **onPayPalFastlaneAddressChange**: (`showBraintreeFastlaneAddressSelector`: () => `Promise`\<`undefined` \| `CustomerAddress`\>) => `void`

Is a callback that shows Braintree Fastlane popup with customer addresses
when get triggered

#### Type declaration

▸ (`showBraintreeFastlaneAddressSelector`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `showBraintreeFastlaneAddressSelector` | () => `Promise`\<`undefined` \| `CustomerAddress`\> |

##### Returns

`void`

___

### styles

• `Optional` **styles**: `BraintreeFastlaneStylesOption`

Is a stylisation options for customizing PayPal Fastlane components

Note: the styles for all Braintree Fastlane strategies should be the same,
because they will be provided to PayPal library only for the first strategy initialization
no matter what strategy was initialised first
