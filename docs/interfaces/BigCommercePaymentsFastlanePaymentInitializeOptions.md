[@bigcommerce/checkout-sdk](../README.md) / BigCommercePaymentsFastlanePaymentInitializeOptions

# Interface: BigCommercePaymentsFastlanePaymentInitializeOptions

A set of options that are required to initialize the BigCommercePayments Fastlane payment
method for presenting on the page.

Also, BigCommercePayments requires specific options to initialize BigCommercePayments Fastlane Card Component
```html
<!-- This is where the BigCommercePayments Fastlane Card Component will be inserted -->
<div id="container"></div>
```
```js
service.initializePayment({
    methodId: 'bigcommerce_payments_fastlane',
    bigcommerce_payments_fastlane: {
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

- [styles](BigCommercePaymentsFastlanePaymentInitializeOptions.md#styles)

### Methods

- [onChange](BigCommercePaymentsFastlanePaymentInitializeOptions.md#onchange)
- [onError](BigCommercePaymentsFastlanePaymentInitializeOptions.md#onerror)
- [onInit](BigCommercePaymentsFastlanePaymentInitializeOptions.md#oninit)

## Properties

### styles

• `Optional` **styles**: `PayPalFastlaneStylesOption`

Is a stylisation options for customizing BigCommercePayments Fastlane components

Note: the styles for all BigCommercePaymentsFastlane strategies should be the same,
because they will be provided to PayPal library only for the first strategy initialization
no matter what strategy was initialised first

## Methods

### onChange

▸ `Optional` **onChange**(`showPayPalCardSelector`): `void`

Is a callback that shows fastlane stored instruments
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
where the BigCommercePayments Fastlane form should be inserted into.

#### Parameters

| Name | Type |
| :------ | :------ |
| `renderPayPalCardComponent` | (`container`: `string`) => `void` |

#### Returns

`void`
