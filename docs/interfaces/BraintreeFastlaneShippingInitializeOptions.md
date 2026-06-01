[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / BraintreeFastlaneShippingInitializeOptions

# Interface: BraintreeFastlaneShippingInitializeOptions

A set of options that are required to initialize the shipping step of
checkout in order to support Braintree Fastlane.

## Properties

### onPayPalFastlaneAddressChange?

> `optional` **onPayPalFastlaneAddressChange?**: (`showBraintreeFastlaneAddressSelector`) => `void`

Is a callback that shows Braintree Fastlane popup with customer addresses
when get triggered

#### Parameters

##### showBraintreeFastlaneAddressSelector

() => `Promise`\<`CustomerAddress` \| `undefined`\>

#### Returns

`void`

***

### styles?

> `optional` **styles?**: `BraintreeFastlaneStylesOption`

Is a stylisation options for customizing PayPal Fastlane components

Note: the styles for all Braintree Fastlane strategies should be the same,
because they will be provided to PayPal library only for the first strategy initialization
no matter what strategy was initialised first
