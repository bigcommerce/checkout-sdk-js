[@bigcommerce/checkout-sdk](../README.md) › [PaypalExpressPaymentInitializeOptions](paypalexpresspaymentinitializeoptions.md)

# Interface: PaypalExpressPaymentInitializeOptions

A set of options that are required to initialize the PayPal Express payment
method.

```js
service.initializePayment({
    methodId: 'paypalexpress',
});
```

An additional flag can be passed in to always start the payment flow through
a redirect rather than a popup.

```js
service.initializePayment({
    methodId: 'paypalexpress',
    paypalexpress: {
        useRedirectFlow: true,
    },
});
```

## Hierarchy

* **PaypalExpressPaymentInitializeOptions**

## Index

### Properties

* [useRedirectFlow](paypalexpresspaymentinitializeoptions.md#optional-useredirectflow)

## Properties

### `Optional` useRedirectFlow

• **useRedirectFlow**? : *undefined | false | true*
