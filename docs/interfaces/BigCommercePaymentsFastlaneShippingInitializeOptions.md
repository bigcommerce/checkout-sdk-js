[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / BigCommercePaymentsFastlaneShippingInitializeOptions

# Interface: BigCommercePaymentsFastlaneShippingInitializeOptions

A set of options that are required to initialize the shipping step of
checkout in order to support BigCommercePayments  Fastlane.

## Properties

### onPayPalFastlaneAddressChange?

> `optional` **onPayPalFastlaneAddressChange?**: (`showPayPalFastlaneAddressSelector`) => `void`

Is a callback that shows BigCommercePayments Fastlane popup with customer addresses
when get triggered

#### Parameters

##### showPayPalFastlaneAddressSelector

() => `Promise`\<`CustomerAddress` \| `undefined`\>

#### Returns

`void`

***

### styles?

> `optional` **styles?**: `PayPalFastlaneStylesOption`

Is a stylisation options for customizing BigCommercePayments Fastlane components

Note: the styles for all BigCommercePayments Fastlane strategies should be the same,
because they will be provided to fastlane library only for the first strategy initialization
no matter what strategy was initialised first
