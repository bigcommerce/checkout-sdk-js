[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / PayPalCommerceFastlaneShippingInitializeOptions

# Interface: PayPalCommerceFastlaneShippingInitializeOptions

A set of options that are required to initialize the shipping step of
checkout in order to support PayPal Commerce Fastlane.

## Properties

### onPayPalFastlaneAddressChange?

> `optional` **onPayPalFastlaneAddressChange?**: (`showPayPalFastlaneAddressSelector`) => `void`

Is a callback that shows PayPal Fastlane popup with customer addresses
when get triggered

#### Parameters

##### showPayPalFastlaneAddressSelector

() => `Promise`\<`CustomerAddress` \| `undefined`\>

#### Returns

`void`

***

### styles?

> `optional` **styles?**: `PayPalFastlaneStylesOption`

Is a stylisation options for customizing PayPal Fastlane components

Note: the styles for all PayPal Commerce Fastlane strategies should be the same,
because they will be provided to PayPal library only for the first strategy initialization
no matter what strategy was initialised first
