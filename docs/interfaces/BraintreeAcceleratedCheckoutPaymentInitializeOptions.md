[@bigcommerce/checkout-sdk](../README.md) / BraintreeAcceleratedCheckoutPaymentInitializeOptions

# Interface: BraintreeAcceleratedCheckoutPaymentInitializeOptions

A set of options that are required to initialize the Braintree Accelerated Checkout payment
method for presenting on the page.

Also, Braintree requires specific options to initialize Braintree Accelerated Checkout Credit Card Component
```html
<!-- This is where the Braintree Credit Card Component will be inserted -->
<div id="container"></div>
```

```js
service.initializePayment({
    methodId: 'braintreeacceleratedcheckout',
    braintreeacceleratedcheckout: {
        onInit: (renderPayPalComponentMethod) => renderPayPalComponentMethod('#container-id'),
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

- [styles](BraintreeAcceleratedCheckoutPaymentInitializeOptions.md#styles)

### Methods

- [onInit](BraintreeAcceleratedCheckoutPaymentInitializeOptions.md#oninit)

## Properties

### styles

• `Optional` **styles**: `BraintreeConnectStylesOption`

Is a stylisation options for customizing PayPal Connect components

Note: the styles for all Braintree Accelerated Checkout strategies should be the same,
because they will be provided to PayPal library only for the first strategy initialization
no matter what strategy was initialised first

## Methods

### onInit

▸ `Optional` **onInit**(`renderPayPalComponentMethod`): `void`

Is a callback that takes the CSS selector of a container
where the PayPal Connect form should be inserted into.

#### Parameters

| Name | Type |
| :------ | :------ |
| `renderPayPalComponentMethod` | (`container`: `string`) => `void` |

#### Returns

`void`
