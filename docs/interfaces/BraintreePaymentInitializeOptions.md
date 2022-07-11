[@bigcommerce/checkout-sdk](../README.md) / BraintreePaymentInitializeOptions

# Interface: BraintreePaymentInitializeOptions

A set of options that are required to initialize the Braintree payment
method. You need to provide the options if you want to support 3D Secure
authentication flow.

```html
<!-- These containers are where the hosted (iframed) credit card fields will be inserted -->
<div id="card-number"></div>
<div id="card-name"></div>
<div id="card-expiry"></div>
<div id="card-code"></div>
```

```js
service.initializePayment({
    methodId: 'braintree',
    braintree: {
        form: {
            fields: {
                cardNumber: { containerId: 'card-number' },
                cardName: { containerId: 'card-name' },
                cardExpiry: { containerId: 'card-expiry' },
                cardCode: { containerId: 'card-code' },
            },
        },
    },
});
```

Additional options can be passed in to customize the fields and register
event callbacks.

```js
service.initializePayment({
    methodId: 'braintree',
    creditCard: {
        form: {
            fields: {
                cardNumber: { containerId: 'card-number' },
                cardName: { containerId: 'card-name' },
                cardExpiry: { containerId: 'card-expiry' },
                cardCode: { containerId: 'card-code' },
            },
            styles: {
                default: {
                    color: '#000',
                },
                error: {
                    color: '#f00',
                },
                focus: {
                    color: '#0f0',
                },
            },
            onBlur({ fieldType }) {
                console.log(fieldType);
            },
            onFocus({ fieldType }) {
                console.log(fieldType);
            },
            onEnter({ fieldType }) {
                console.log(fieldType);
            },
            onCardTypeChange({ cardType }) {
                console.log(cardType);
            },
            onValidate({ errors, isValid }) {
                console.log(errors);
                console.log(isValid);
            },
        },
    },
});
```

## Table of contents

### Properties

- [form](BraintreePaymentInitializeOptions.md#form)
- [threeDSecure](BraintreePaymentInitializeOptions.md#threedsecure)

## Properties

### form

• `Optional` **form**: [`BraintreeFormOptions`](BraintreeFormOptions.md)

**`alpha`**
Please note that this option is currently in an early stage of
development. Therefore the API is unstable and not ready for public
consumption.

___

### threeDSecure

• `Optional` **threeDSecure**: [`BraintreeThreeDSecureOptions`](BraintreeThreeDSecureOptions.md)
