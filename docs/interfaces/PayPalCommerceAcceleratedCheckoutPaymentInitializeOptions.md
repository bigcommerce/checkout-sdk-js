[@bigcommerce/checkout-sdk](../README.md) / PayPalCommerceAcceleratedCheckoutPaymentInitializeOptions

# Interface: PayPalCommerceAcceleratedCheckoutPaymentInitializeOptions

A set of options that are required to initialize the PayPalCommerce Accelerated Checkout payment
method for presenting on the page.

Also, PayPalCommerce requires specific options to initialize PayPalCommerce Accelerated Checkout Credit Card Component
```html
<!-- This is where the PayPalCommerce Credit Card Component will be inserted -->
<div id="container"></div>
```
```js
service.initializePayment({
    methodId: 'paypalcommerceacceleratedcheckout',
    paypalcommerceacceleratedcheckout: {
        onInit: (renderPayPalComponentMethod) => renderPayPalComponentMethod('#container-id'),
        onChange: (showPayPalConnectCardSelector) => showPayPalConnectCardSelector(),
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

- [styles](PayPalCommerceAcceleratedCheckoutPaymentInitializeOptions.md#styles)

### Methods

- [onChange](PayPalCommerceAcceleratedCheckoutPaymentInitializeOptions.md#onchange)
- [onInit](PayPalCommerceAcceleratedCheckoutPaymentInitializeOptions.md#oninit)

## Properties

### styles

• `Optional` **styles**: `PayPalCommerceConnectStylesOption`

Is a stylisation options for customizing PayPal Connect components

Note: the styles for all PayPalCommerce Accelerated Checkout strategies should be the same,
because they will be provided to PayPal library only for the first strategy initialization
no matter what strategy was initialised first

## Methods

### onChange

▸ `Optional` **onChange**(`showPayPalConnectCardSelector`): `void`

Is a callback that shows PayPal stored instruments
when get triggered

#### Parameters

| Name | Type |
| :------ | :------ |
| `showPayPalConnectCardSelector` | () => `Promise`<`undefined` \| `CardInstrument`\> |

#### Returns

`void`

___

### onInit

▸ `Optional` **onInit**(`renderPayPalConnectCardComponent`): `void`

Is a callback that takes the CSS selector of a container
where the PayPal Connect form should be inserted into.

#### Parameters

| Name | Type |
| :------ | :------ |
| `renderPayPalConnectCardComponent` | (`container`: `string`) => `void` |

#### Returns

`void`
