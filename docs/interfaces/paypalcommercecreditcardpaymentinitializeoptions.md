[@bigcommerce/checkout-sdk](../README.md) › [PaypalCommerceCreditCardPaymentInitializeOptions](paypalcommercecreditcardpaymentinitializeoptions.md)

# Interface: PaypalCommerceCreditCardPaymentInitializeOptions

A set of options that are required to initialize the PayPal Commerce payment
method for presenting its credit card form.

```html
<!-- These containers are where the hosted (iframed) credit card fields will be inserted -->
<div id="card-number"></div>
<div id="card-name"></div>
<div id="card-expiry"></div>
<div id="card-code"></div>
```

```js
service.initializePayment({
    methodId: 'paypalcommerce',
    paypalcommerce: {
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
    methodId: 'paypalcommerce',
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

**`alpha`** 
Please note that this option is currently in an early stage of
development. Therefore the API is unstable and not ready for public
consumption.

## Hierarchy

* **PaypalCommerceCreditCardPaymentInitializeOptions**

## Index

### Properties

* [form](paypalcommercecreditcardpaymentinitializeoptions.md#form)

## Properties

###  form

• **form**: *[PaypalCommerceFormOptions](paypalcommerceformoptions.md)*
