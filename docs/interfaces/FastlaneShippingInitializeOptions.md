[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / FastlaneShippingInitializeOptions

# Interface: FastlaneShippingInitializeOptions

A set of options that are required to initialize the shipping step of
checkout in order to support Fastlane (PayPal Commerce, BigCommerce Payments, or Braintree).

This is a unified interface that can be used across all Fastlane implementations
to simplify initialization and avoid provider-specific checks.

## Properties

### onPayPalFastlaneAddressChange?

> `optional` **onPayPalFastlaneAddressChange?**: (`showFastlaneAddressSelector`) => `void`

A callback that shows the Fastlane popup with customer addresses
when triggered

#### Parameters

##### showFastlaneAddressSelector

() => `Promise`\<`CustomerAddress` \| `undefined`\>

#### Returns

`void`

***

### styles?

> `optional` **styles?**: [`FastlaneStylesOption`](../type-aliases/FastlaneStylesOption.md)

Styling options for customizing Fastlane components

Note: the styles for all Fastlane strategies should be the same,
because they will be provided to the Fastlane library only for the first strategy initialization
no matter what strategy was initialized first
