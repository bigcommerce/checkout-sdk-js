[@bigcommerce/checkout-sdk](../README.md) / PayPalCommerceFastlanePaymentInitializeOptions

# Interface: PayPalCommerceFastlanePaymentInitializeOptions

A set of options that are required to initialize the PayPalCommerce Accelerated Checkout payment
method for presenting on the page.

Also, PayPalCommerce requires specific options to initialize PayPal Fastlane Card Component
```html
<!-- This is where the PayPal Fastlane Card Component will be inserted -->
<div id="container"></div>
```
```js
service.initializePayment({
    methodId: 'paypalcommerceacceleratedcheckout', // PayPal Fastlane has 'paypalcommerceacceleratedcheckout' method id
    paypalcommercefastlane: {
        onInit: (renderPayPalCardComponent) => renderPayPalCardComponent('#container-id'),
        onChange: (showPayPalCardSelector) => showPayPalCardSelector(),
        styles: {
             root: {
                 backgroundColorPrimary: 'transparent',
                 errorColor: '#C40B0B',
                 fontFamily: 'Montserrat, Helvetica, Arial, sans-serif',
             },
             input: {
                 borderRadius: '0.25rem',
                 borderColor: '#9E9E9E',
                 focusBorderColor: '#4496F6',
             },
             toggle: {
                 colorPrimary: '#0F005E',
                 colorSecondary: '#ffffff',
             },
             text: {
                 body: {
                     color: '#222222',
                     fontSize: '1rem',
                 },
                 caption: {
                     color: '#515151',
                     fontSize: '0.875rem',
                 },
             },
             branding: 'light',
        },
    },
});
```

## Table of contents

### Properties

- [styles](PayPalCommerceFastlanePaymentInitializeOptions.md#styles)

### Methods

- [onChange](PayPalCommerceFastlanePaymentInitializeOptions.md#onchange)
- [onError](PayPalCommerceFastlanePaymentInitializeOptions.md#onerror)
- [onInit](PayPalCommerceFastlanePaymentInitializeOptions.md#oninit)

## Properties

### styles

• `Optional` **styles**: `PayPalFastlaneStylesOption`

Is a stylisation options for customizing PayPal Fastlane components

Note: the styles for all PayPalCommerceFastlane strategies should be the same,
because they will be provided to PayPal library only for the first strategy initialization
no matter what strategy was initialised first

## Methods

### onChange

▸ `Optional` **onChange**(`showPayPalCardSelector`): `void`

Is a callback that shows PayPal stored instruments
when get triggered

#### Parameters

| Name | Type |
| :------ | :------ |
| `showPayPalCardSelector` | () => `Promise`<`undefined` \| `CardInstrument`\> |

#### Returns

`void`

___

### onError

▸ `Optional` **onError**(`error`): `void`

Callback that handles errors

#### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `unknown` |

#### Returns

`void`

___

### onInit

▸ `Optional` **onInit**(`renderPayPalCardComponent`): `void`

Is a callback that takes the CSS selector of a container
where the PayPal Fastlane form should be inserted into.

#### Parameters

| Name | Type |
| :------ | :------ |
| `renderPayPalCardComponent` | (`container`: `string`) => `void` |

#### Returns

`void`
