[@bigcommerce/checkout-sdk](../README.md) › [ChasePayInitializeOptions](chasepayinitializeoptions.md)

# Interface: ChasePayInitializeOptions

A set of options that are required to initialize the Chase Pay payment method.

```html
<!-- This is where the Chase Pay button will be inserted -->
<div id="wallet-button"></div>
```

```js
service.initializePayment({
    methodId: 'chasepay',
    chasepay: {
        walletButton: 'wallet-button',
    },
});
```

Additional options can be passed in to customize the fields and register
event callbacks.

```html
<!-- This is where the Chase Pay logo will be inserted -->
<div id="logo"></div>
```

```js
service.initializePayment({
    methodId: 'chasepay',
    chasepay: {
        walletButton: 'wallet-button',
        logoContainer: 'logo',
        onPaymentSelect() {
            console.log('Selected');
        },
        onCancel() {
            console.log('Cancelled');
        },
    },
});
```

## Hierarchy

* **ChasePayInitializeOptions**

## Index

### Properties

* [logoContainer](chasepayinitializeoptions.md#optional-logocontainer)
* [walletButton](chasepayinitializeoptions.md#optional-walletbutton)

### Methods

* [onCancel](chasepayinitializeoptions.md#optional-oncancel)
* [onPaymentSelect](chasepayinitializeoptions.md#optional-onpaymentselect)

## Properties

### `Optional` logoContainer

• **logoContainer**? : *undefined | string*

This container is used to host the chasepay branding logo.
It should be an HTML element.

___

### `Optional` walletButton

• **walletButton**? : *undefined | string*

This walletButton is used to set an event listener, provide an element ID if you want
users to be able to launch the ChasePay wallet modal by clicking on a button.
It should be an HTML element.

## Methods

### `Optional` onCancel

▸ **onCancel**(): *void*

A callback that gets called when the customer cancels their payment selection.

**Returns:** *void*

___

### `Optional` onPaymentSelect

▸ **onPaymentSelect**(): *void*

A callback that gets called when the customer selects a payment option.

**Returns:** *void*
