[@bigcommerce/checkout-sdk](../README.md) / CreditCardPaymentInitializeOptions_2

# Interface: CreditCardPaymentInitializeOptions\_2

A set of options to initialize credit card payment methods, unless those
methods require provider-specific configuration. If the initialization is
successful, hosted (iframed) credit card fields will be inserted into the the
containers specified in the options.

```html
<!-- These containers are where the hosted (iframed) credit card fields will be inserted -->
<div id="card-number"></div>
<div id="card-name"></div>
<div id="card-expiry"></div>
<div id="card-code"></div>
```

```js
service.initializePayment({
    methodId: 'authorizenet',
    creditCard: {
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
    methodId: 'authorizenet',
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
                    fontFamily: 'Arial',
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

- [form](CreditCardPaymentInitializeOptions_2.md#form)

## Properties

### form

• **form**: `default`
