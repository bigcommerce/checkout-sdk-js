[@bigcommerce/checkout-sdk](../README.md) / PayPalCommerceFastlaneCustomerInitializeOptions

# Interface: PayPalCommerceFastlaneCustomerInitializeOptions

A set of options that are optional to initialize the PayPalCommerce Fastlane customer strategy
that are responsible for PayPalCommerce Fastlane components styling and initialization

```js
service.initializeCustomer({
    methodId: 'paypalcommerceacceleratedcheckout', // PayPalCommerce Fastlane has 'paypalcommerceacceleratedcheckout' method id
    paypalcommercefastlane: {
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

- [styles](PayPalCommerceFastlaneCustomerInitializeOptions.md#styles)

## Properties

### styles

• `Optional` **styles**: `PayPalFastlaneStylesOption`

Is a stylisation options for customizing PayPal Fastlane components

Note: the styles for all PayPalCommerce Fastlane strategies should be the same,
because they will be provided to PayPal library only for the first strategy initialization
no matter which strategy was initialised first
