[@bigcommerce/checkout-sdk](../README.md) / BraintreeFastlanePaymentInitializeOptions

# Interface: BraintreeFastlanePaymentInitializeOptions

A set of options that are required to initialize the Braintree Fastlane payment
method for presenting on the page.

Also, Braintree requires specific options to initialize Braintree Fastlane Credit Card Component
```html
<!-- This is where the Braintree Credit Card Component will be inserted -->
<div id="container"></div>
```

```js
service.initializePayment({
    methodId: 'braintreeacceleratedcheckout',
    braintreefastlane: {
        onInit: (renderPayPalComponentMethod) => renderPayPalComponentMethod('#container-id'),
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

- [styles](BraintreeFastlanePaymentInitializeOptions.md#styles)

### Methods

- [onChange](BraintreeFastlanePaymentInitializeOptions.md#onchange)
- [onInit](BraintreeFastlanePaymentInitializeOptions.md#oninit)

## Properties

### styles

• `Optional` **styles**: `BraintreeFastlaneStylesOption`

Is a stylisation options for customizing Braintree Fastlane components

Note: the styles for all Braintree Fastlane strategies should be the same,
because they will be provided to PayPal library only for the first strategy initialization
no matter what strategy was initialised first

## Methods

### onChange

▸ `Optional` **onChange**(`showPayPalCardSelector`): `void`

Is a callback that shows Braintree stored instruments
when get triggered

#### Parameters

| Name | Type |
| :------ | :------ |
| `showPayPalCardSelector` | () => `Promise`<`undefined` \| `CardInstrument`\> |

#### Returns

`void`

___

### onInit

▸ `Optional` **onInit**(`renderPayPalComponentMethod`): `void`

Is a callback that takes the CSS selector of a container
where the Braintree Fastlane form should be inserted into.

#### Parameters

| Name | Type |
| :------ | :------ |
| `renderPayPalComponentMethod` | (`container`: `string`) => `void` |

#### Returns

`void`
